import BaseScreen from "./componets/baseScreen";
import Header from "./componets/header/header";

export default function Home() {
  return (
    <div className="bg-green-50">
      <BaseScreen>
        <Header />

      </BaseScreen>
    </div>
  );
}