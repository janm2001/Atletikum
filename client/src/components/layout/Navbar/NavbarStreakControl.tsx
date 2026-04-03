import { Badge, HoverCard } from "@mantine/core";
import { IconFlame } from "@tabler/icons-react";
import NavbarStreakDropdown from "./NavbarStreakDropdown";
import classes from "./Navbar.module.css";

interface NavbarStreakControlProps {
  dailyStreak: number;
  streakAtRisk: boolean;
  hasActivityToday: boolean;
  streakExpiresAt: string | null;
  hoverCardWidth?: number;
  position?: "bottom-end" | "bottom";
  badgeSize?: string;
  iconSize?: number;
}

const NavbarStreakControl = ({
  dailyStreak,
  streakAtRisk,
  hasActivityToday,
  streakExpiresAt,
  hoverCardWidth = 250,
  position = "bottom-end",
  badgeSize = "lg",
  iconSize = 14,
}: NavbarStreakControlProps) => (
  <HoverCard width={hoverCardWidth} shadow="md" position={position} withArrow>
    <HoverCard.Target>
      <Badge
        size={badgeSize}
        variant="light"
        color={streakAtRisk ? "red" : "orange"}
        leftSection={<IconFlame size={iconSize} />}
        className={classes.surfaceControl}
      >
        {dailyStreak}
      </Badge>
    </HoverCard.Target>
    <HoverCard.Dropdown className={classes.hoverDropdown}>
      <NavbarStreakDropdown
        streakAtRisk={streakAtRisk}
        hasActivityToday={hasActivityToday}
        streakExpiresAt={streakExpiresAt}
        dailyStreak={dailyStreak}
      />
    </HoverCard.Dropdown>
  </HoverCard>
);

export default NavbarStreakControl;
