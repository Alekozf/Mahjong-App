import { TopBar } from '../components/Shell.jsx';
import { href } from '../lib/router.js';

export default function NotFound() {
  return (
    <div className="screen">
      <TopBar />
      <h1 tabIndex={-1}>Page not found</h1>
      <p className="lead">That link doesn’t match a page in this app.</p>
      <a className="btn btn--primary" href={href('/')}>Go to the session overview</a>
    </div>
  );
}
