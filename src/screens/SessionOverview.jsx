import { TopBar } from '../components/Shell.jsx';
import { HeroArt } from '../components/Visuals.jsx';
import Icon from '../components/Icon.jsx';
import { href } from '../lib/router.js';

export default function SessionOverview() {
  return (
    <div className="screen screen--overview">
      <TopBar />
      <section className="overview" aria-labelledby="overview-title">
        <div className="overview__text">
          <h1 id="overview-title" tabIndex={-1}>Your first mahjong session, explained</h1>
          <p className="lead">
            What happens at a beginner-friendly mahjong session, and how to join in. No experience or preparation needed.
          </p>
        </div>
        <div className="overview__art">
          <HeroArt />
        </div>
        <div className="overview__actions">
          <a className="btn btn--primary btn--block" href={href('/session/guide')}>
            Explore a first session
            <Icon name="arrow" size={20} className="btn__arrow" />
          </a>
          <a className="action-card" href={href('/learn')}>
            <span className="action-card__text">
              <strong>Learn the basics</strong>
              <span>Three short lessons · Optional</span>
            </span>
            <Icon name="chevron" size={22} />
          </a>
          <a className="text-link overview__ref" href={href('/reference')}>
            <Icon name="reference" size={20} />
            Already playing? Open reference
          </a>
        </div>
      </section>
      <aside className="ruleset-note" aria-label="About the rules">
        <Icon name="info" size={20} />
        <p>
          Lessons follow <strong>MCR</strong> (Mahjong Competition Rules), an international ruleset. Tables can play house rules, so check with your host.
        </p>
      </aside>
      <p className="independent-note">An independent student proposal. Not affiliated with any club or university.</p>
    </div>
  );
}
