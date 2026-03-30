import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiTriggerProps {
  trigger: boolean;
  variant?: "default" | "achievement" | "levelup";
}

const ConfettiTrigger = ({ trigger, variant = "default" }: ConfettiTriggerProps) => {
  useEffect(() => {
    if (!trigger) return;

    if (variant === "levelup") {
      const end = Date.now() + 2000;
      const colors = ["#4c6ef5", "#228be6", "#15aabf", "#12b886"];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    } else if (variant === "achievement") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ffd700", "#ff6b35", "#f7c59f"],
      });
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [trigger, variant]);

  return null;
};

export default ConfettiTrigger;
