import Breadcrumb from "@/components/Common/Breadcrumb";
import Terms from "@/components/Terms";

const TermsPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Terms of Use Page"
        description="COBRA.UNIT Terms of Use Policy."
      />
      <Terms />
    </>
  );
};

export default TermsPage;
