"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/api/auth";

export function useAuth() {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((res) => setUser(res))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}


// const { user, loading } = useAuth();
