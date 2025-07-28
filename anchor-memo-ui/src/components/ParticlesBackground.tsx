import { type FC, useEffect } from 'react';

export const ParticlesBackground: FC = () => {
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.querySelector('.particles');
      if (particlesContainer) {
        for (let i = 0; i < 9; i++) {
          const particle = document.createElement('div');
          particle.className = 'particle';
          particlesContainer.appendChild(particle);
        }
      }
    };
    createParticles();
  }, []);

  return <div className="particles" />;
};
