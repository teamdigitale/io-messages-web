import React, { Component } from "react";

import { withNamespaces } from "react-i18next";

import { Alert } from "design-react-kit";

const { localStorage } = window;

import { getUserTokenOrRedirect } from "../utils/msal";
import { getFromBackend } from "../utils/backend";

import "./Login.css";

class Login extends Component {
  componentDidMount = async () => {
    try {
      const configuration = await getFromBackend({ path: "configuration" });
      const user = await getUserTokenOrRedirect(configuration);

      console.debug(
        "Login::getUserTokenOrRedirect::userToken",
        user.token,
        user.user
      );

      if (user) {
        // bearer token to call backend api
        localStorage.setItem("userToken", user.token);
        // profile data (email, name, ...)
        localStorage.setItem("userData", JSON.stringify(user.user.idToken));

        const apimUser = await getFromBackend({ path: "user" });
        console.debug("Login::apimUser", apimUser);

        const isApiAdmin =
          apimUser.apimUser &&
          new Set(apimUser.apimUser.groupNames).has("ApiAdmin");

        localStorage.setItem("isApiAdmin", isApiAdmin);
        window.location.replace("/");
      }
    } catch (e) {
      console.error("Login needed", e);
    }
  };

  render() {
    const { t } = this.props;

    return (
      <section className="login--container">
        <Alert color="info">{t("message")}</Alert>
      </section>
    );
  }
}

export default withNamespaces("login")(Login);
