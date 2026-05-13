import { useParams } from "react-router-dom";
import Registration from "@/pages/Registration";

const CourseSubscribe = () => {
  const { id } = useParams<{ id: string }>();

  return <Registration courseId={id || ""} />;
};

export default CourseSubscribe;
