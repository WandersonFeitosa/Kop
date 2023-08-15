import { Request, Response } from "express";
import { client } from "..";

export class CheckAllowedUser {
  async checkAllowedUser(req: Request, res: Response) {
    const server_id = process.env.SERVER_ID as string;
    const player_role_id = "1108047769576407070";
    const aquiles_role_id = "1108047918335795392";
    const admin_role_id = "1107701514417475625";
    const { username } = req.params;

    const guild = client.guilds.cache.get(server_id);

    const userQuery = await guild?.members.fetch({ query: username, limit: 1 });

    const userId = userQuery?.first()?.id;

    if (!userId)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const user = guild?.members.cache.get(userId);

    const isUserAquiles = user?.roles.cache.has(aquiles_role_id);

    const isUserPlayer = user?.roles.cache.has(player_role_id);

    const isUserAdmin = user?.roles.cache.has(admin_role_id);

    if (!isUserAquiles && !isUserPlayer) {
      return res.status(401).json({ error: "Usuário não autorizado" });
    }

    res.status(200).json({
      message: "Usuário autorizado",
      userId,
      isUserAdmin,
      isUserAquiles,
      isUserPlayer,
    });
  }
}
