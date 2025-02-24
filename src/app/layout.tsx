import { Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import { CssBaseline } from "@mui/material";
import StyledJsxRegistry from "./registry";
import Providers from "./providers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata = {
  title: "Minha Aplicação",
  description: "Descrição da minha aplicação",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={roboto.variable}>
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
