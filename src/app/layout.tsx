import { Manrope } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import { CssBaseline } from "@mui/material";
import StyledJsxRegistry from "./registry";
import Providers from "./providers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata = {
  title: "JobPortal",
  description: "Busque vagas de tecnologia em um so lugar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={manrope.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <StyledJsxRegistry>
              <Providers>{children}</Providers>
            </StyledJsxRegistry>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
