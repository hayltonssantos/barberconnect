// src/services/barbeariaService.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export interface BarbeariaConfig {
  contribuinte: string;
  nomeEstabelecimento: string;
  endereco: string;
  telefone: string;
  horarioFuncionamento: {
    abertura: string;
    fechamento: string;
    diasFuncionamento: string[];
  };
  configuracoesSistema: {
    intervaloAgendamento: number;
    antecedenciaMinima: number;
    antecedenciaMaxima: number;
    permiteCancelamento: boolean;
    tempoLimiteCancelamento: number;
  };
  criadoEm: any;
  atualizadoEm: any;
  ativo: boolean;
}

export interface Funcionario {
  id?: string;
  nome: string;
  email?: string;
  telefone?: string;
  especialidades: string[];
  horarioTrabalho: {
    [key: string]: {
      inicio: string;
      fim: string;
      trabalhando: boolean;
    };
  };
  ativo: boolean;
  criadoEm: any;
}

export interface Cliente {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  ultimaVisita?: any;
  totalVisitas: number;
  preferencias?: string[];
  ativo: boolean;
  criadoEm: any;
}

export interface Servico {
  id?: string;
  nome: string;
  descricao: string;
  duracao: number; // em minutos
  preco: number;
  categoria: string;
  ativo: boolean;
  criadoEm: any;
}

export interface Agendamento {
  id?: string;
  clienteId: string;
  funcionarioId: string;
  servicoIds: string[];
  data: any;
  horarioInicio: string;
  horarioFim: string;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string;
  precoTotal: number;
  criadoEm: any;
  atualizadoEm: any;
}

class BarbeariaService {
  // Verificar se contribuinte já existe
  async verificarContribuinte(contribuinte: string): Promise<boolean> {
    try {
      const barbeariaRef = doc(db, 'barbearias', contribuinte);
      const barbeariaSnap = await getDoc(barbeariaRef);
      return barbeariaSnap.exists();
    } catch (error) {
      console.error('Erro ao verificar contribuinte:', error);
      throw error;
    }
  }

  // Criar nova barbearia
  async criarBarbearia(config: Omit<BarbeariaConfig, 'criadoEm' | 'atualizadoEm' | 'ativo'>): Promise<void> {
    try {
      // Verificar se já existe
      const existe = await this.verificarContribuinte(config.contribuinte);
      if (existe) {
        throw new Error('Contribuinte já cadastrado');
      }

      const barbeariaData: BarbeariaConfig = {
        ...config,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        ativo: true
      };

      // Criar documento da barbearia
      const barbeariaRef = doc(db, 'barbearias', config.contribuinte);
      await setDoc(barbeariaRef, barbeariaData);

      // Criar subcoleções iniciais
      await this.criarEstruturasIniciais(config.contribuinte);

    } catch (error) {
      console.error('Erro ao criar barbearia:', error);
      throw error;
    }
  }

  // Criar estruturas iniciais da barbearia
  private async criarEstruturasIniciais(contribuinte: string): Promise<void> {
    try {
      // Criar funcionário padrão "Todos"
      const funcionarioTodos: Funcionario = {
        nome: 'Todos os Funcionários',
        especialidades: [],
        horarioTrabalho: {},
        ativo: true,
        criadoEm: serverTimestamp()
      };

      const funcionariosRef = collection(db, 'barbearias', contribuinte, 'funcionarios');
      await addDoc(funcionariosRef, funcionarioTodos);

      // Criar serviços padrão
      const servicosPadrao: Omit<Servico, 'id' | 'criadoEm'>[] = [
        {
          nome: 'Corte Masculino',
          descricao: 'Corte de cabelo masculino tradicional',
          duracao: 30,
          preco: 25.00,
          categoria: 'Corte',
          ativo: true
        },
        {
          nome: 'Barba',
          descricao: 'Aparar e modelar barba',
          duracao: 20,
          preco: 15.00,
          categoria: 'Barba',
          ativo: true
        }
      ];

      const servicosRef = collection(db, 'barbearias', contribuinte, 'servicos');
      for (const servico of servicosPadrao) {
        await addDoc(servicosRef, {
          ...servico,
          criadoEm: serverTimestamp()
        });
      }

    } catch (error) {
      console.error('Erro ao criar estruturas iniciais:', error);
      throw error;
    }
  }

  // Buscar configuração da barbearia
  async buscarConfiguracao(contribuinte: string): Promise<BarbeariaConfig | null> {
    try {
      const barbeariaRef = doc(db, 'barbearias', contribuinte);
      const barbeariaSnap = await getDoc(barbeariaRef);
      
      if (barbeariaSnap.exists()) {
        return { ...barbeariaSnap.data() } as BarbeariaConfig;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      throw error;
    }
  }

  // Atualizar configuração da barbearia
  async atualizarConfiguracao(contribuinte: string, config: Partial<BarbeariaConfig>): Promise<void> {
    try {
      const barbeariaRef = doc(db, 'barbearias', contribuinte);
      await updateDoc(barbeariaRef, {
        ...config,
        atualizadoEm: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  }

  // Funcionários
  async adicionarFuncionario(contribuinte: string, funcionario: Omit<Funcionario, 'id' | 'criadoEm'>): Promise<string> {
    try {
      const funcionariosRef = collection(db, 'barbearias', contribuinte, 'funcionarios');
      const docRef = await addDoc(funcionariosRef, {
        ...funcionario,
        criadoEm: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      throw error;
    }
  }

  async buscarFuncionarios(contribuinte: string): Promise<Funcionario[]> {
    try {
      const funcionariosRef = collection(db, 'barbearias', contribuinte, 'funcionarios');
      const q = query(funcionariosRef, where('ativo', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Funcionario));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw error;
    }
  }

  // Clientes
  async adicionarCliente(contribuinte: string, cliente: Omit<Cliente, 'id' | 'criadoEm' | 'totalVisitas'>): Promise<string> {
    try {
      const clientesRef = collection(db, 'barbearias', contribuinte, 'clientes');
      const docRef = await addDoc(clientesRef, {
        ...cliente,
        totalVisitas: 0,
        criadoEm: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  }

  async buscarClientes(contribuinte: string): Promise<Cliente[]> {
    try {
      const clientesRef = collection(db, 'barbearias', contribuinte, 'clientes');
      const q = query(clientesRef, where('ativo', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Cliente));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  // Serviços
  async buscarServicos(contribuinte: string): Promise<Servico[]> {
    try {
      const servicosRef = collection(db, 'barbearias', contribuinte, 'servicos');
      const q = query(servicosRef, where('ativo', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Servico));
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
  }

  // Agendamentos
  async criarAgendamento(contribuinte: string, agendamento: Omit<Agendamento, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<string> {
    try {
      const agendamentosRef = collection(db, 'barbearias', contribuinte, 'agendamentos');
      const docRef = await addDoc(agendamentosRef, {
        ...agendamento,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  async buscarAgendamentos(contribuinte: string, dataInicio?: Date, dataFim?: Date): Promise<Agendamento[]> {
    try {
      const agendamentosRef = collection(db, 'barbearias', contribuinte, 'agendamentos');
      let q = query(agendamentosRef);

      // Adicionar filtros de data se fornecidos
      if (dataInicio && dataFim) {
        q = query(agendamentosRef, 
          where('data', '>=', dataInicio),
          where('data', '<=', dataFim)
        );
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Agendamento));
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  }
}

export const barbeariaService = new BarbeariaService();
