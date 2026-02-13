import { useLocation } from 'react-router-dom';

export function RouteDebug() {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 text-xs rounded z-50">
      Current Route: {location.pathname}
    </div>
  );
}

