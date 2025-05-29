// src/services/barbeariaService.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  Barbearia, 
  Funcionario, 
  Cliente, 
  Servico, 
  Agendamento,
  BaseEntity 
} from '@/types';

export class BarbeariaService {
  // ===== BARBEARIA =====
  
  // Verificar se contribuinte existe
  static async verificarContribuinte(contribuinte: string): Promise<boolean> {
    try {
      const barbeariaRef = doc(db, 'barbearias', contribuinte);
      const barbeariaSnap = await getDoc(barbeariaRef);
      return barbeariaSnap.exists();
    } catch (error) {
      console.error('Erro ao verificar contribuinte:', error);
      throw new Error('Erro ao verificar contribuinte');
    }
  }

  // Criar nova barbearia
  static async criarBarbearia(
    barbearia: Omit<Barbearia, keyof BaseEntity>,
    criadoPor: string
  ): Promise<void> {
    try {
      // Verificar se já existe
      const existe = await this.verificarContribuinte(barbearia.contribuinte);
      if (existe) {
        throw new Error('Contribuinte já cadastrado');
      }

      const barbeariaData = {
        ...barbearia,
        criadoPor,
        id: barbearia.contribuinte,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        ativo: true
      };

      // Usar batch para operações atômicas
      const batch = writeBatch(db);

      // Criar documento da barbearia
      const barbeariaRef = doc(db, 'barbearias', barbearia.contribuinte);
      batch.set(barbeariaRef, barbeariaData);

      // Criar funcionário padrão "Todos"
      const funcionarioTodosRef = doc(collection(db, 'barbearias', barbearia.contribuinte, 'funcionarios'));
      batch.set(funcionarioTodosRef, {
        id: funcionarioTodosRef.id,
        nome: 'Todos os Funcionários',
        especialidades: [],
        horarioTrabalho: {},
        ativo: true,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });

      // Criar serviços padrão
      const servicosPadrao = [
        {
          nome: 'Corte Masculino',
          descricao: 'Corte de cabelo masculino tradicional',
          duracao: 30,
          preco: 25.00,
          categoria: 'Corte'
        },
        {
          nome: 'Barba',
          descricao: 'Aparar e modelar barba',
          duracao: 20,
          preco: 15.00,
          categoria: 'Barba'
        },
        {
          nome: 'Corte + Barba',
          descricao: 'Pacote completo corte e barba',
          duracao: 45,
          preco: 35.00,
          categoria: 'Pacote'
        }
      ];

      servicosPadrao.forEach(servico => {
        const servicoRef = doc(collection(db, 'barbearias', barbearia.contribuinte, 'servicos'));
        batch.set(servicoRef, {
          ...servico,
          id: servicoRef.id,
          ativo: true,
          criadoEm: serverTimestamp(),
          atualizadoEm: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Erro ao criar barbearia:', error);
      throw error;
    }
  }

   static async adicionarFuncionario(
    contribuinte: string, 
    funcionario: Omit<Funcionario, keyof BaseEntity>
  ): Promise<string> {
    try {
      const funcionarioRef = doc(collection(db, 'barbearias', contribuinte, 'funcionarios'));
      const funcionarioData = {
        ...funcionario,
        id: funcionarioRef.id,
        ativo: true,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      };
      
      await setDoc(funcionarioRef, funcionarioData);
      return funcionarioRef.id;
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error);
      throw error;
    }
  }

  static async atualizarFuncionario(
    contribuinte: string,
    funcionarioId: string,
    updates: Partial<Funcionario>
  ): Promise<void> {
    try {
      const funcionarioRef = doc(db, 'barbearias', contribuinte, 'funcionarios', funcionarioId);
      await updateDoc(funcionarioRef, {
        ...updates,
        atualizadoEm: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw error;
    }
  }

  static async removerFuncionario(
    contribuinte: string,
    funcionarioId: string
  ): Promise<void> {
    try {
      const funcionarioRef = doc(db, 'barbearias', contribuinte, 'funcionarios', funcionarioId);
      await updateDoc(funcionarioRef, {
        ativo: false,
        atualizadoEm: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      throw error;
    }
  }

  
  // Buscar barbearia
  static async buscarBarbearia(contribuinte: string): Promise<Barbearia | null> {
    try {
      const barbeariaRef = doc(db, 'barbearias', contribuinte);
      const barbeariaSnap = await getDoc(barbeariaRef);
      
      if (barbeariaSnap.exists()) {
        const data = barbeariaSnap.data();
        return {
          ...data,
          id: barbeariaSnap.id,
          criadoEm: data.criadoEm?.toDate() || new Date(),
          atualizadoEm: data.atualizadoEm?.toDate() || new Date()
        } as Barbearia;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao buscar barbearia:', error);
      throw new Error('Erro ao buscar dados da barbearia');
    }
  }

  // Atualizar barbearia
  static async atualizarBarbearia(
    contribuinte: string, 
    updates: Partial<Barbearia>
  ): Promise<void> {
    try {
      const barbeariaRef = doc(db, 'barbearias', contribuinte);
      await updateDoc(barbeariaRef, {
        ...updates,
        atualizadoEm: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar barbearia:', error);
      throw error;
    }
  }

  // ===== FUNCIONÁRIOS =====
  
  static async buscarFuncionarios(contribuinte: string): Promise<Funcionario[]> {
    try {
      const funcionariosRef = collection(db, 'barbearias', contribuinte, 'funcionarios');
      const q = query(funcionariosRef, where('ativo', '==', true), orderBy('nome'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          criadoEm: data.criadoEm?.toDate() || new Date(),
          atualizadoEm: data.atualizadoEm?.toDate() || new Date()
        } as Funcionario;
      });
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw error;
    }
  }



  // ===== CLIENTES =====
  
  static async buscarClientes(contribuinte: string): Promise<Cliente[]> {
    try {
      const clientesRef = collection(db, 'barbearias', contribuinte, 'clientes');
      const q = query(clientesRef, where('ativo', '==', true), orderBy('nome'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          criadoEm: data.criadoEm?.toDate() || new Date(),
          atualizadoEm: data.atualizadoEm?.toDate() || new Date(),
          ultimaVisita: data.ultimaVisita?.toDate() || null,
          dataNascimento: data.dataNascimento?.toDate() || null
        } as Cliente;
      });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  static async adicionarCliente(
    contribuinte: string, 
    cliente: Omit<Cliente, keyof BaseEntity | 'totalVisitas'>
  ): Promise<string> {
    try {
      const clienteRef = doc(collection(db, 'barbearias', contribuinte, 'clientes'));
      const clienteData = {
        ...cliente,
        id: clienteRef.id,
        totalVisitas: 0,
        ativo: true,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      };
      
      await setDoc(clienteRef, clienteData);
      return clienteRef.id;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  }

  // ===== SERVIÇOS =====
  
  static async buscarServicos(contribuinte: string): Promise<Servico[]> {
    try {
      const servicosRef = collection(db, 'barbearias', contribuinte, 'servicos');
      const q = query(servicosRef, where('ativo', '==', true), orderBy('categoria'), orderBy('nome'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          criadoEm: data.criadoEm?.toDate() || new Date(),
          atualizadoEm: data.atualizadoEm?.toDate() || new Date()
        } as Servico;
      });
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }
  }

  // ===== AGENDAMENTOS =====
  
  static async buscarAgendamentos(
    contribuinte: string,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<Agendamento[]> {
    try {
      const agendamentosRef = collection(db, 'barbearias', contribuinte, 'agendamentos');
      let q = query(agendamentosRef, orderBy('data'), orderBy('horarioInicio'));

      if (dataInicio && dataFim) {
        q = query(
          agendamentosRef,
          where('data', '>=', Timestamp.fromDate(dataInicio)),
          where('data', '<=', Timestamp.fromDate(dataFim)),
          orderBy('data'),
          orderBy('horarioInicio')
        );
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          data: data.data?.toDate() || new Date(),
          criadoEm: data.criadoEm?.toDate() || new Date(),
          atualizadoEm: data.atualizadoEm?.toDate() || new Date()
        } as Agendamento;
      });
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }
  }

  static async criarAgendamento(
    contribuinte: string,
    agendamento: Omit<Agendamento, keyof BaseEntity>
  ): Promise<string> {
    try {
      const agendamentoRef = doc(collection(db, 'barbearias', contribuinte, 'agendamentos'));
      const agendamentoData = {
        ...agendamento,
        id: agendamentoRef.id,
        data: Timestamp.fromDate(agendamento.data),
        ativo: true,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      };
      
      await setDoc(agendamentoRef, agendamentoData);
      return agendamentoRef.id;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }
}
