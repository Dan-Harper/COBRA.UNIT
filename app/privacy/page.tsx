import Breadcrumb from "@/components/Common/Breadcrumb";
import Privacy from "@/components/Privacy";

const PrivacyPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Privacy Page"
        description="COBRA.UNIT Privacy Policy."
      />
      <Privacy />
    </>
  );
};

export default PrivacyPage;
