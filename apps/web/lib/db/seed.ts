import { db } from "./index";
import {
  courts,
  adminBlocks,
  reservations,
  managers,
  settings,
  users,
} from "./schema";
import bcrypt from "bcryptjs";

// Importando os dados mockados
import { mockCourts } from "../mock/courts";
import { mockBlocks } from "../mock/blocks";
import { mockReservations } from "../mock/reservations";
import { mockManagers } from "../mock/managers";
import { mockSettings } from "../mock/settings";

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  try {
    // 1. Limpando os dados existentes
    // A ordem de deleção importa devido a chaves estrangeiras (reservations depepende de courts)
    console.log("🧹 Limpando dados antigos...");
    await db.delete(reservations);
    await db.delete(adminBlocks);
    await db.delete(managers);
    await db.delete(settings);
    await db.delete(courts);
    await db.delete(users);

    // 2. Criando o usuário Admin default
    console.log("👨‍💻 Criando usuário admin...");
    await db.insert(users).values({
      username: "admin",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin",
    });

    console.log("🖥️ Criando usuário totem...");
    await db.insert(users).values({
      username: "totem",
      passwordHash: bcrypt.hashSync("totem123", 10),
      role: "totem",
    });

    console.log("📺 Criando usuário tv...");
    await db.insert(users).values({
      username: "tv",
      passwordHash: bcrypt.hashSync("tv123", 10),
      role: "tv",
    });

    // 3. Inserindo configurações
    console.log("⚙️  Inserindo configurações (rain_mode)...");
    await db.insert(settings).values({
      key: "rain_mode",
      value: mockSettings.rainMode ? "1" : "0",
    });

    // 4. Inserindo Quadras
    console.log("🎾 Inserindo quadras...");
    const courtsToInsert = mockCourts.map(({ id, ...rest }) => rest);
    // Armazenar os IDs inseridos para referências se as tabelas usarem
    // Mas os mocks das reservas e blocos já usam IDs específicos (1, 2, 3...)
    // Se a gente omitir o ID e a tabela tiver AUTO_INCREMENT, os dados de bloqueios podem não associar os IDs corretos
    // Solução mais segura pro seed mockado: vamos inserir COM os IDs mockados e dps atualizar as sequences!
    await db.insert(courts).values(mockCourts);

    // 5. Inserindo Bloqueios (Travas)
    console.log("🚫 Inserindo travas (blocks)...");
    await db.insert(adminBlocks).values(mockBlocks);

    // 6. Inserindo Reservas
    console.log("📅 Inserindo reservas...");
    await db.insert(reservations).values(mockReservations);

    // 7. Inserindo Responsáveis/Gestores
    console.log("👷 Inserindo gerentes (managers)...");
    await db.insert(managers).values(mockManagers);

    console.log("✅ Seed finalizado com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    process.exit(1);
  }
}

main();
