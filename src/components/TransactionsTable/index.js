import { useEffect } from "react";
import { api } from "../../services/api";
import { Container } from "./styles";

export function TransactionsTable() {
  useEffect(() => {
    api.get("transactions").then((response) => console.log(response.data));
  }, []);
  return (
    <Container>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Valor</th>
            <th>Categoria</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>Dev site</td>
            <td className="withdraw">-R$ 120000</td>
            <td>Desenvolvimento</td>
            <td>20/02/2000 </td>
          </tr>
          <tr>
            <td>Dev site</td>
            <td className="deposit">R$ 120000</td>
            <td>Desenvolvimento</td>
            <td>20/02/2000 </td>
          </tr>
        </tbody>
      </table>
    </Container>
  );
}
