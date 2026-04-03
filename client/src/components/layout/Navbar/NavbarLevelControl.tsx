import { Badge, HoverCard } from "@mantine/core";
import { useTranslation } from "react-i18next";
import NavbarLevelDropdown from "./NavbarLevelDropdown";
import classes from "./Navbar.module.css";

interface NavbarLevelControlProps {
  level: number;
  totalXp: number;
  hoverCardWidth?: number;
  position?: "bottom-end" | "bottom";
  badgeSize?: string;
}

const NavbarLevelControl = ({
  level,
  totalXp,
  hoverCardWidth = 250,
  position = "bottom-end",
  badgeSize = "lg",
}: NavbarLevelControlProps) => {
  const { t } = useTranslation();

  return (
    <HoverCard width={hoverCardWidth} shadow="md" position={position} withArrow>
      <HoverCard.Target>
        <Badge
          variant="light"
          color="stitch"
          size={badgeSize}
          className={classes.surfaceControl}
        >
          {t("nav.levelBadge", { level })}
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown className={classes.hoverDropdown}>
        <NavbarLevelDropdown level={level} totalXp={totalXp} />
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

export default NavbarLevelControl;
