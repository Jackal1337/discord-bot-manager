import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function useDemo() {
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDemoStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/demo-status`);
        setIsDemo(response.data.demo === true);
      } catch (error) {
        console.error('Failed to check demo status:', error);
        setIsDemo(false);
      } finally {
        setLoading(false);
      }
    };

    checkDemoStatus();
  }, []);

  return { isDemo, loading };
}
