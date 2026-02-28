import { useEffect, useState } from "react";
import "./App.css";
import { EditorPage } from "./features/text-effect/pages/EditorPage";
import { RenderPage } from "./features/text-effect/pages/RenderPage";
import {
  getRenderConfigFromLocation,
  isRenderMode,
} from "./features/text-effect/model/configCodec";

function App() {
  const [search, setSearch] = useState(() => window.location.search);

  useEffect(() => {
    const onPopState = () => setSearch(window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const renderMode = isRenderMode(search);

  if (renderMode) {
    return <RenderPage baseConfig={getRenderConfigFromLocation(search)} />;
  }

  return <EditorPage />;
}

export default App;
