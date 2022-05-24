import { useEffect } from 'react';

export const useMount = (cb: () => void): void => {
  useEffect(cb, []);
};
