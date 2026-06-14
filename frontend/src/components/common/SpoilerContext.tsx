"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SpoilerState {
  hide: boolean;
  setHide: (v: boolean) => void;
}

const SpoilerContext = createContext<SpoilerState>({ hide: false, setHide: () => {} });

export function SpoilerProvider({ children }: { children: React.ReactNode }) {
  const [hide, setHideRaw] = useState(true);

  // Hydrate the persisted preference from localStorage after mount. This reads from an
  // external store (browser storage) on first paint, so the one-time setState is intentional.
  useEffect(() => {
    const v = localStorage.getItem("ggwp_spoilers_hide");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (v != null) setHideRaw(v === "1");
  }, []);

  const setHide = (v: boolean) => {
    setHideRaw(v);
    localStorage.setItem("ggwp_spoilers_hide", v ? "1" : "0");
  };

  return <SpoilerContext.Provider value={{ hide, setHide }}>{children}</SpoilerContext.Provider>;
}

export function useSpoiler() {
  return useContext(SpoilerContext);
}
