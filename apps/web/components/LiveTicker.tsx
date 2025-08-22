'use client';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

export default function LiveTicker() {
  const [state, setState] = useState<{
    salesLastHour: number;
    t: string;
  } | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true,
    });
    socket.on('stats', (payload) => setState(payload));
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
      <span className="text-white/70">Live Market:</span>
      <span className="font-medium">{state?.salesLastHour ?? 0} sales</span>
      <span className="text-white/60">last hour</span>
      <span className="ml-auto text-white/40">
        {state?.t && new Date(state.t).toLocaleTimeString()}
      </span>
    </div>
  );
}
