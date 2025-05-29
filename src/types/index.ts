// src/types/index.ts

// Tipos básicos do sistema
export interface BaseEntity {
  id: string;
  criadoEm: Date;
  atualizadoEm?: Date;
  ativo: boolean;
}

// Tipos de status para agendamentos
export type StatusAgendamento = 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';

// Tipos de dias da semana
export type DiaSemana = 'domingo' | 'segunda' | 'terça' | 'quarta' | 'quinta' | 'sexta' | 'sábado';

// Tipos de roles de usuário
export type UserRole = 'admin' | 'funcionario' | 'gerente';

// Interface para horário de trabalho
export interface HorarioTrabalho {
  [key: string]: {
    inicio: string;
    fim: string;
    trabalhando: boolean;
  };
}

// Interface para configurações de sistema
export interface ConfiguracoesSistema {
  intervaloAgendamento: number; // em minutos
  antecedenciaMinima: number; // em horas
  antecedenciaMaxima: number; // em dias
  permiteCancelamento: boolean;
  tempoLimiteCancelamento: number; // em horas
}

// Interface para horário de funcionamento
export interface HorarioFuncionamento {
  abertura: string;
  fechamento: string;
  diasFuncionamento: DiaSemana[];
}
