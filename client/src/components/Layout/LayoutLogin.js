import React from 'react';
import HeaderLogin from './HeaderLogin';
import { Helmet } from "react-helmet";
import  { Toaster } from "react-hot-toast";

const LayoutLogin = ({children,title,description,keywords,author}) => {
  return (
    <div>
      <Helmet>
        <meta charSet='utf-8' />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
        <title>{title}</title>
      </Helmet>
        <HeaderLogin />
            <main style={{ minHeight: "80vh"}}>
              <Toaster />
                {children}
            </main>
    </div>
  );
};

LayoutLogin.defaultProps = {
  title: "F1-comeptition",
  description: "F1 simulation website",
  keywords: "mern,react, express, mongodb",
  author: "Marouane Marhrani",
};

export default LayoutLogin;