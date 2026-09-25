import React from 'react';
import { Sparkles, Wind, Eye, ShieldCheck, Heart, Cpu, Code2, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="apple-page-wrapper about-view">
      {/* Apple Hero Header */}
      <section className="apple-hero-header">
        <span className="apple-category-eyebrow">The Philosophy & Physics Behind Jinglee</span>
        <h1 className="apple-hero-title">Digital Heritage for Modern Screens</h1>
        <p className="apple-hero-sub">
          Bridging centuries-old cultural protection charms with hyper-realistic 
          physics simulation to bring serenity, focus, and positive energy to your daily workflow.
        </p>
      </section>

      {/* Apple Story Card */}
      <section className="apple-bento-grid">
        <div className="bento-card bento-full-narrative">
          <span className="apple-pill-badge gold">Our Inspiration</span>
          <h2 className="bento-headline-large">Why Desktop Dangles?</h2>
          <div className="bento-narrative-columns">
            <p>
              In traditional homes across Tamil Nadu, Southeast Asia, and the global diaspora, 
              sacred charms—such as the <strong>Gnana Vel</strong>, <strong>Lord Venkateswara</strong>, 
              <strong>Nimbu Mirchi</strong>, and <strong>Drishti Bommai</strong>—hang above doorways, 
              car mirrors, and work desks to invite clarity, focus, and good fortune.
            </p>
            <p>
              In our modern digital era, creators and engineers spend 8 to 14 hours staring at computer displays. 
              <strong> Jinglee</strong> brings this grounding presence directly into your macOS notch and system display—swinging 
              naturally with momentum, micro-inertia, and tactile charm.
            </p>
          </div>
        </div>
      </section>

      {/* Physics Engine Architecture Bento Grid */}
      <section className="apple-specs-section">
        <span className="apple-category-eyebrow">Engine Architecture</span>
        <h2 className="apple-section-headline">The Matter.js Physics Engine</h2>
        <p className="apple-section-subline">How we engineered digital charms to feel organic, alive, and tactile.</p>

        <div className="apple-bento-grid">
          {/* 1. 5-Segment Cord */}
          <div className="bento-card bento-card-compact">
            <div className="bento-step-pill">01</div>
            <h3 className="bento-title-compact">5-Segment Pliable Cord</h3>
            <p className="bento-desc-compact">
              Instead of a rigid rod, Jinglee simulates a 5-link pliable composite chain with natural slack, 
              sag, and bowing. As you pull or swing the charm, the cord bends organically with inter-link constraint damping.
            </p>
          </div>

          {/* 2. Cursor Reluctance / Shyness */}
          <div className="bento-card bento-card-compact">
            <div className="bento-step-pill">02</div>
            <h3 className="bento-title-compact">Cursor Reluctance ("Shyness")</h3>
            <p className="bento-desc-compact">
              When your cursor approaches within 180px, the charm organically dodges and tilts away. 
              Move quickly or click down to catch it with drag immunity and throw it across your monitor with momentum.
            </p>
          </div>

          {/* 3. Zero-Gravity Ribbon Flutter */}
          <div className="bento-card bento-card-compact">
            <div className="bento-step-pill">03</div>
            <h3 className="bento-title-compact">Zero-Gravity Ribbon Flutter</h3>
            <p className="bento-desc-compact">
              Trailing silk threads and tassels underneath charms flare buoyantly with cubic Bezier S-curves, 
              reacting smoothly to atmospheric velocity and cursor proximity.
            </p>
          </div>

          {/* 4. Ritual & Decay Dynamics */}
          <div className="bento-card bento-card-compact">
            <div className="bento-step-pill">04</div>
            <h3 className="bento-title-compact">Ritual & Freshness Lifecycle</h3>
            <p className="bento-desc-compact">
              Just like real Nimbu Mirchi hung outside doorways, the digital charm tracks time. 
              Users can perform the weekly ritual of "Hanging Fresh Nimbu" from the menubar to reset freshness.
            </p>
          </div>
        </div>
      </section>

      {/* Craftsmanship Numbers */}
      <section className="apple-craft-numbers-section">
        <div className="apple-craft-metric">
          <span className="craft-number">38+</span>
          <span className="craft-label">Handcrafted Charms</span>
        </div>
        <div className="apple-craft-metric">
          <span className="craft-number">9</span>
          <span className="craft-label">Global Collections</span>
        </div>
        <div className="apple-craft-metric">
          <span className="craft-number">120Hz</span>
          <span className="craft-label">ProMotion Physics</span>
        </div>
        <div className="apple-craft-metric">
          <span className="craft-number">0</span>
          <span className="craft-label">Network Tracking</span>
        </div>
      </section>
    </div>
  );
}
