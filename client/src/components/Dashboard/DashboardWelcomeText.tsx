import { Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

const DashboardWelcomeText = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Text c="dimmed" mt={4}>
        {t('dashboard.welcome')}
      </Text>
    </div>
  );
};

export default DashboardWelcomeText;
