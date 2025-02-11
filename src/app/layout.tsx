// import type { Metadata } from "next";
// import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import { CssBaseline } from "@mui/material";
import StyledJsxRegistry from "./registry";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={roboto.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <StyledJsxRegistry>{children}</StyledJsxRegistry>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
