import { useEffect } from "react";
import { Container } from "./styles";

export function TransactionsTable() {
  useEffect(() => {
    fetch("http://localhost:3000/api/transactions").then((response) =>
      response.json().then((data) => console.log(data))
    );
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
