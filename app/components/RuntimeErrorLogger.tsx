"use client";

import { useEffect } from "react";

export default function RuntimeErrorLogger() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      console.group("[RuntimeErrorLogger] error");
      console.log("message:", e.message);
      console.log("filename:", e.filename);
      console.log("lineno:", e.lineno);
      console.log("colno:", e.colno);
      console.log("error:", e.error);
      console.groupEnd();
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      console.group("[RuntimeErrorLogger] unhandledrejection");
      console.log("reason:", e.reason);
      console.log("promise:", e.promise);
      console.groupEnd();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
