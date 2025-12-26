import { useState } from 'react';
import { buttonClasses } from '../ui/classes';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      <p style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Count: {count}</p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setCount(count + 1)}
          className={buttonClasses({ variant: 'primary', size: 'md' })}
        >
          +1
        </button>
        <button
          onClick={() => setCount(0)}
          className={buttonClasses({ variant: 'secondary', size: 'md' })}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
