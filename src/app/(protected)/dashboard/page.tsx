"use client"

import { useUser } from "@clerk/nextjs";
import React from "react";

const DashboardPage = () => {
  const { user } = useUser();
  console.log(user);
  return <div>{user?.firstName}</div>;
};

export default DashboardPage;
