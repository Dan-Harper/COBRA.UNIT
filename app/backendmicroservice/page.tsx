import Breadcrumb from "@/components/Common/Breadcrumb";
import BackendMicroservice from "@/components/BackendMicroservice";

const BackendMicroservicePage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Backend Microservice"
        description="COBRA.UNIT Backend Microservice."
      />
      <BackendMicroservice />
    </>
  );
};

export default BackendMicroservicePage;