import React from 'react';

export default function ToranGarland() {
  // Repeating array of traditional mango leaves & marigold beads
  const items = Array.from({ length: 24 });

  return (
    <div className="toran-container">
      {/* Top Hanging Garland Rope */}
      <div className="toran-rope"></div>

      {/* Hanging Mango Leaves & Marigold Beads */}
      <div className="toran-garland-row">
        {items.map((_, i) => (
          <div key={i} className="toran-unit">
            {/* Small Marigold Bead */}
            <div className="marigold-bead"></div>
            {/* Mango Leaf Shape with Central Vein */}
            <div className="mango-leaf">
              <div className="leaf-vein"></div>
            </div>
            {/* Tiny Golden Bell Droplet */}
            <div className="toran-bell-drop"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
