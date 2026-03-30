import type { ComponentType } from "react";
import {
  IconShoe,
  IconBrain,
  IconStar,
  IconFlame,
  IconDiamond,
  IconTrophy,
  IconMedal,
  IconCrown,
  IconBarbell,
  IconBook,
  IconSparkles,
} from "@tabler/icons-react";

export type BadgeIconComponent = ComponentType<{
  size?: number | string;
  stroke?: number | string;
}>;

export const achievementBadgeIconMap: Record<string, BadgeIconComponent> = {
  shoe: IconShoe,
  brain: IconBrain,
  star: IconStar,
  flame: IconFlame,
  diamond: IconDiamond,
  trophy: IconTrophy,
  medal: IconMedal,
  crown: IconCrown,
  barbell: IconBarbell,
  book: IconBook,
  sparkles: IconSparkles,
};

export const DEFAULT_ACHIEVEMENT_BADGE_ICON = IconStar;