import { Link } from 'react-router-dom';

export default function Card({ to, children, className = '' }) {
  const classes = `card-interactive ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  return <div className={`card-base ${className}`}>{children}</div>;
}
