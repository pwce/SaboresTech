// AutoservicioView.jsx
import { AutoservicioProvider, useAutoservicio, PASOS } from "../../context/AutoservicioContext";
import WelcomeScreen from "./WelcomeScreen";
import TipoServicioScreen from "./TipoServicioScreen";
import MenuScreen from "./MenuScreen";
import CarritoScreen from "./CarritoScreen";
import PagoScreen from "./PagoScreen";

function AutoservicioRouter() {
  const { paso } = useAutoservicio();

  switch (paso) {
    case PASOS.BIENVENIDA:
      return <WelcomeScreen />;
    case PASOS.TIPO_SERVICIO:
      return <TipoServicioScreen />;
    case PASOS.MENU:
      return <MenuScreen />;
    case PASOS.CARRITO:
      return <CarritoScreen />;
    case PASOS.PAGO:
      return <PagoScreen />;
    default:
      return <WelcomeScreen />;
  }
}

export default function AutoservicioView() {
  return (
    <AutoservicioProvider>
      <AutoservicioRouter />
    </AutoservicioProvider>
  );
}
