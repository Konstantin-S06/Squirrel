import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Header from '../components/Header';
import styles from './FriendsPage.module.css';

interface Friend {
  id: string;
  name: string;
  level: number;
  avatarUrl?: string;
}

interface IncomingRequest {
  uid: string;
  name: string;
  level: number;
}

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [showFriendCode, setShowFriendCode] = useState<boolean>(false);
  const [friendCode, setFriendCode] = useState<string>('');
  const [inputFriendCode, setInputFriendCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadFriendData();
  }, []);

  const loadFriendData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const friendUids: string[] = userData.friends || [];
      const incomingUids: string[] = userData.incomingFriendRequests || [];

      setFriendCode(user.uid);

      // Load friends
      const friendPromises = friendUids.map(async (uid): Promise<Friend | null> => {
        const friendDoc = await getDoc(doc(db, 'users', uid));
        if (friendDoc.exists()) {
          const friendData = friendDoc.data();
          return {
            id: uid,
            name: friendData.name || 'Unknown',
            level: friendData.level || 1,
            avatarUrl: friendData.avatarUrl || '',
          } as Friend;
        }
        return null;
      });

      const friendResults = await Promise.all(friendPromises);
      setFriends(friendResults.filter((f): f is Friend => f !== null));

      // Load incoming requests
      const requestPromises = incomingUids.map(async (uid): Promise<IncomingRequest | null> => {
        const requestDoc = await getDoc(doc(db, 'users', uid));
        if (requestDoc.exists()) {
          const requestData = requestDoc.data();
          return {
            uid,
            name: requestData.name || 'Unknown',
            level: requestData.level || 1,
          } as IncomingRequest;
        }
        return null;
      });

      const requestResults = await Promise.all(requestPromises);
      setIncomingRequests(requestResults.filter((r): r is IncomingRequest => r !== null));
    } catch (err) {
      console.error('Error loading friend data:', err);
      setError('Failed to load friend data');
    }
  };

  const handleGenerateFriendCode = () => {
    setShowFriendCode(true);
    setError('');
    setSuccess('');
  };

  const handleCopyFriendCode = () => {
    if (friendCode) {
      navigator.clipboard.writeText(friendCode);
      setSuccess('Friend code copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSendFriendRequest = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in');
      return;
    }

    const targetUid = inputFriendCode.trim();
    if (!targetUid) {
      setError('Please enter a friend code');
      return;
    }

    if (targetUid === user.uid) {
      setError('Cannot send friend request to yourself');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if target user exists
      const targetRef = doc(db, 'users', targetUid);
      const targetDoc = await getDoc(targetRef);

      if (!targetDoc.exists()) {
        setError('Invalid friend code');
        setLoading(false);
        return;
      }

      const targetData = targetDoc.data();
      const currentUserRef = doc(db, 'users', user.uid);
      const currentUserDoc = await getDoc(currentUserRef);

      if (!currentUserDoc.exists()) {
        setError('User data not found');
        setLoading(false);
        return;
      }

      const currentUserData = currentUserDoc.data();
      const friends: string[] = currentUserData.friends || [];
      const outgoingRequests: string[] = currentUserData.outgoingFriendRequests || [];
      const targetIncomingRequests: string[] = targetData.incomingFriendRequests || [];
      const targetFriends: string[] = targetData.friends || [];

      // Check if already friends
      if (friends.includes(targetUid) || targetFriends.includes(user.uid)) {
        setError('Already friends with this user');
        setLoading(false);
        return;
      }

      // Check if request already sent
      if (outgoingRequests.includes(targetUid)) {
        setError('Friend request already sent');
        setLoading(false);
        return;
      }

      // Check if request already received
      if (targetIncomingRequests.includes(user.uid)) {
        setError('This user already sent you a friend request');
        setLoading(false);
        return;
      }

      // Update both users
      await updateDoc(currentUserRef, {
        outgoingFriendRequests: arrayUnion(targetUid),
      });

      await updateDoc(targetRef, {
        incomingFriendRequests: arrayUnion(user.uid),
      });

      setSuccess('Friend request sent!');
      setInputFriendCode('');
      await loadFriendData();
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestUid: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const currentUserRef = doc(db, 'users', user.uid);
      const requestUserRef = doc(db, 'users', requestUid);

      // Add to friends arrays
      await updateDoc(currentUserRef, {
        friends: arrayUnion(requestUid),
        incomingFriendRequests: arrayRemove(requestUid),
      });

      await updateDoc(requestUserRef, {
        friends: arrayUnion(user.uid),
        outgoingFriendRequests: arrayRemove(user.uid),
      });

      setSuccess('Friend request accepted!');
      await loadFriendData();
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setError('Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestUid: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const currentUserRef = doc(db, 'users', user.uid);
      const requestUserRef = doc(db, 'users', requestUid);

      // Remove from request arrays
      await updateDoc(currentUserRef, {
        incomingFriendRequests: arrayRemove(requestUid),
      });

      await updateDoc(requestUserRef, {
        outgoingFriendRequests: arrayRemove(user.uid),
      });

      setSuccess('Friend request rejected');
      await loadFriendData();
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setError('Failed to reject friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Header />
      <header className={styles.header}>
        <h1 className={styles.title}>Friends</h1>
      </header>

      <div className={styles.backButtonContainer}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      <main className={styles.main}>
        {/* Friend Code Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Friend Code</h2>
          {!showFriendCode ? (
            <button onClick={handleGenerateFriendCode} className={styles.generateButton}>
              Generate Friend Code
            </button>
          ) : (
            <div className={styles.friendCodeDisplay}>
              <input
                type="text"
                value={friendCode}
                readOnly
                className={styles.friendCodeInput}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button onClick={handleCopyFriendCode} className={styles.copyButton}>
                Copy
              </button>
            </div>
          )}
        </div>

        {/* Send Friend Request Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Send Friend Request</h2>
          <div className={styles.sendRequestContainer}>
            <input
              type="text"
              value={inputFriendCode}
              onChange={(e) => setInputFriendCode(e.target.value)}
              placeholder="Enter friend code"
              className={styles.friendCodeInput}
            />
            <button
              onClick={handleSendFriendRequest}
              disabled={loading}
              className={styles.sendButton}
            >
              {loading ? 'Sending...' : 'Send Friend Request'}
            </button>
          </div>
        </div>

        {/* Incoming Requests Section */}
        {incomingRequests.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Incoming Friend Requests</h2>
            <div className={styles.requestsList}>
              {incomingRequests.map((request) => (
                <div key={request.uid} className={styles.requestCard}>
                  <div className={styles.requestInfo}>
                    <div className={styles.requestName}>{request.name}</div>
                    <div className={styles.requestLevel}>Level {request.level}</div>
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      onClick={() => handleAcceptRequest(request.uid)}
                      disabled={loading}
                      className={styles.acceptButton}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.uid)}
                      disabled={loading}
                      className={styles.rejectButton}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Friends</h2>
          <div className={styles.friendsList}>
            {friends.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No friends yet. Add some friends to get started!</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className={styles.friendCard}>
                  <div className={styles.squirrelIcon}>🐿️</div>
                  <div className={styles.friendInfo}>
                    <div className={styles.friendName}>{friend.name}</div>
                    <div className={styles.friendLevel}>Level {friend.level}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
      </main>
    </div>
  );
};

export default FriendsPage;
