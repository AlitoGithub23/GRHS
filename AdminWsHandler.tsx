import { createWsConnection } from "@/lib/createWsConnection";
import toast from "react-hot-toast";
import { Report } from "@/Reports/Domain/Report";
import { Badge } from "@/components/ui/badge";

export class AdminWsHandler {
  private static WS_DASHBOARD_URL = import.meta.env.VITE_WS_SERVER_URL + "/dashboard";
  private static instance: AdminWsHandler;

  public ws: WebSocket | null = null;

  private constructor() { }

  public static getInstance(): AdminWsHandler {
    if (!AdminWsHandler.instance) {
      AdminWsHandler.instance = new AdminWsHandler();
    }
    return AdminWsHandler.instance;
  }

  public connect(token: string) {
    this.ws = createWsConnection(AdminWsHandler.WS_DASHBOARD_URL, token);
    this.initEvents();
    return this;
  }

  public initEvents() {
    AdminWsHandler.getInstance().ws?.addEventListener("close", () => {
      toast.error(
        <div>
          <strong>[REALTIME]:</strong>
          <span>Desconectado del servidor</span>
        </div>
      );
    });

    AdminWsHandler.getInstance().ws?.addEventListener("error", () => {
      toast.error(
        <div>
          <strong>[REALTIME]:</strong>
          <span>Error al conectar con el servidor</span>
        </div>
      );
    });

    AdminWsHandler.getInstance().ws?.addEventListener("message", handlerNotifyRuleViolation);
  }
}

const handlerNotifyRuleViolation = (data: MessageEvent) => {
  const reportData = JSON.parse(data.data) as Report;

  if (reportData.scope === "rules" && reportData.property === "violation") {
    toast.error(
      <div className="flex flex-col gap-2">
        <strong>[REPORT]:</strong>
        <Badge variant={"destructive"}>Violación de regla</Badge>
        <span className="text-destructive">Revisar lo antes posible los reportes</span>
      </div>,
      {
        duration: 1000 * 30,
      }
    );
  }
};
