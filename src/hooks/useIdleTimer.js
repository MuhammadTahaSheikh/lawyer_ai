// src/hooks/useIdleTimer.js
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const DEFAULT_TIMEOUT = 1000 * 60 * 30; 

export default function useIdleTimer(timeout = DEFAULT_TIMEOUT) {
  const navigate = useNavigate();
  const timerId = useRef(null);

  // reset the inactivity timer
  const resetTimer = () => {
    if (timerId.current) clearTimeout(timerId.current);
    timerId.current = setTimeout(async () => {
      // on timeout: sign out and redirect to login
      await signOut(auth);
      navigate('/login');
    }, timeout);
  };

  useEffect(() => {
    // events that indicate activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    // on each activity, reset the timer
    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    // start counting from mount
    resetTimer();

    return () => {
      // cleanup listeners and timer
      if (timerId.current) clearTimeout(timerId.current);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [timeout, navigate]);

  return null;
}