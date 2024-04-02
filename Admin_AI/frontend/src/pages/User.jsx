import React from "react";
// import "./App.css";
// import Nav from "../Nav";
import { makeStyles, CssBaseline, ThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import CSUser from "./../component/CSUser";
import Nav from "../test/component/Nav";
// import Header from "../components/Header";
// import PageHeader from "../components/PageHeader";

// import Employees from "../pages/Employees/Employees";

const theme = createTheme({
  palette: {
    primary: {
      main: "#333996",
      light: "#3c44b126",
    },
    secondary: {
      main: "#f83245",
      light: "#f8324526",
    },
    background: {
      default: "#f4f5fd",
    },
  },
  overrides: {
    MuiAppBar: {
      root: {
        transform: "translateZ(0)",
      },
    },
  },
  props: {
    MuiIconButton: {
      disableRipple: true,
    },
  },
});

const useStyles = makeStyles({
  appMain: {
    paddingLeft: "320px",
    width: "100%",
  },
});

function App() {
  const classes = useStyles();

  return (
    <section className="flex gap-6">
      <Nav />
      <ThemeProvider theme={theme}>
        <div className={classes.appMain}>
          <CSUser />
        </div>
        <CssBaseline />
      </ThemeProvider>
    </section>
  );
}

export default App;
