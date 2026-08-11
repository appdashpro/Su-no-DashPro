import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import type { Step, TooltipRenderProps } from 'react-joyride';
import { ChevronRight, ChevronLeft, Check, X, Compass } from 'lucide-react';

interface ExtendedStep extends Step {
  pathTag?: string;
}

interface TutorialProps {
  run: boolean;
  onFinish: () => void;
  onChangeTab: (tab: string) => void;
  onOpenVisitForm: () => void;
  onOpenSidebar: () => void;
  onCloseVisitForm: () => void;
  onCloseSidebar: () => void;
}

const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
  size,
}: TooltipRenderProps) => {
  const extStep = step as ExtendedStep;
  const progressPercent = Math.round(((index + 1) / size) * 100);

  return (
    <div
      {...tooltipProps}
      className="bg-slate-900/95 backdrop-blur-2xl text-white p-4 sm:p-5 rounded-2xl w-[310px] sm:w-[370px] max-w-[calc(100vw-24px)] max-h-[80vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.65)] border border-slate-700/70 relative z-[10001] font-sans overflow-hidden"
    >
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 z-20">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-500/20 to-emerald-500/10 rounded-2xl pointer-events-none" />

      {/* Close button */}
      <button
        {...closeProps}
        onClick={(e) => {
          e.preventDefault();
          if (closeProps.onClick) closeProps.onClick(e as any);
        }}
        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800 z-20 touch-manipulation"
        title="Fechar Tutorial"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 flex flex-col h-full min-h-0 justify-between">
        {/* Scrollable Content Container */}
        <div className="overflow-y-auto pr-1 flex-1 min-h-0 max-h-[55vh]">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-6">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Compass className="w-3 h-3" />
              Passo {index + 1} de {size}
            </span>
            {extStep.pathTag && (
              <span className="inline-flex items-center text-[10px] sm:text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg whitespace-normal break-words leading-tight max-w-full">
                {extStep.pathTag}
              </span>
            )}
          </div>

          {/* Title */}
          {step.title && (
            <h3 className="text-base sm:text-lg font-bold mb-1.5 pr-4 text-white tracking-tight">
              {step.title}
            </h3>
          )}

          {/* Content */}
          <div className="text-slate-300 leading-relaxed text-[12px] sm:text-[13px] mb-2">
            {step.content}
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-2 mt-2 shrink-0 gap-2">
          {/* Back Button or Left Spacer */}
          <div className="flex items-center min-w-[80px]">
            {index > 0 ? (
              <button
                {...backProps}
                onClick={(e) => {
                  e.preventDefault();
                  if (backProps.onClick) backProps.onClick(e as any);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all duration-200 touch-manipulation border border-slate-700/70 hover:border-slate-600 active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                Anterior
              </button>
            ) : (
              <span className="text-[11px] font-medium text-slate-500 px-1">Início</span>
            )}
          </div>

          {/* Mini Step Dots Indicator */}
          <div className="hidden sm:flex items-center justify-center gap-1 px-2">
            {Array.from({ length: size }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-4 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : i < index
                    ? 'w-1.5 bg-emerald-500/50'
                    : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Next / Complete Primary Button */}
          <div className="flex items-center justify-end">
            <button
              {...primaryProps}
              onClick={(e) => {
                e.preventDefault();
                if (primaryProps.onClick) primaryProps.onClick(e as any);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.5)] transition-all duration-200 active:scale-95 touch-manipulation tracking-tight"
            >
              {isLastStep ? (
                <>
                  <span>Concluir Tour</span>
                  <Check className="w-4 h-4 ml-0.5" />
                </>
              ) : (
                <>
                  <span>Próximo Passo</span>
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function Tutorial({
  run,
  onFinish,
  onChangeTab,
  onOpenVisitForm,
  onOpenSidebar,
  onCloseVisitForm,
  onCloseSidebar,
}: TutorialProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (run) {
      setStepIndex(0);
      onChangeTab('dashboard');
      onCloseSidebar();
      onCloseVisitForm();
    }
  }, [run]);

  const steps: ExtendedStep[] = [
    {
      target: 'body',
      title: 'Bem-vindo ao Suíno DashPro',
      pathTag: '🚀 VISÃO GERAL',
      content: 'Plataforma de gestão técnica de integração suinícola. Acompanhe a seguir como navegar pelas principais rotinas do sistema.',
      placement: 'center',
    },
    {
      target: '#sidebar-item-prioridades',
      title: 'Fila de Prioridades',
      pathTag: '📍 CAMINHO: Menu → Prioridades',
      content: 'Ordena automaticamente os lotes que exigem atenção técnica urgente com base no desvio de consumo, mortalidade e tempo sem visita.',
      placement: 'right-start',
      spotlightPadding: 6,
    },
    {
      target: '#header-title',
      title: 'Painel de Visão Geral',
      pathTag: '📍 CAMINHO: Dashboard → Visão Geral',
      content: 'Acompanhe indicadores do plantel (Total de Lotes, Alertas, Desvio de Consumo e Mortalidade) e o gráfico de evolução consumo real x curva.',
      placement: 'bottom',
    },
    {
      target: '#kpi-alertas',
      title: 'Alertas de Desvio',
      pathTag: '📍 CAMINHO: Dashboard → Card de Alertas',
      content: 'Identifica lotes fora do padrão esperado. Clique no card para abrir o detalhamento com os lotes que necessitam de intervenção.',
      placement: 'bottom',
      spotlightPadding: 8,
    },
    {
      target: '#sidebar-item-integrados',
      title: 'Gestão de Lotes & Produtores',
      pathTag: '📍 CAMINHO: Menu → Gestão de Lotes',
      content: 'Consulte os produtores integrados, fase do lote, data de alojamento, quantidade de cabeças e status do lote.',
      placement: 'right-start',
      spotlightPadding: 6,
    },
    {
      target: '#btn-novo-lancamento',
      title: 'Lançamento de Visitas',
      pathTag: '📍 CAMINHO: Visitas → + Novo Lançamento',
      content: 'Na aba Visitas, clique em "+ Novo Lançamento" para registrar a mortalidade e o consumo de ração na granja.',
      placement: 'bottom-start',
      spotlightPadding: 6,
    },
    {
      target: '#form-integrado-nome',
      title: 'Cálculo Automático da Curva',
      pathTag: '📍 CAMINHO: Formulário → Produtor',
      content: 'Ao selecionar o produtor, o sistema calcula automaticamente a idade do lote em dias e compara o consumo real com a curva de referência.',
      placement: 'bottom',
      spotlightPadding: 8,
    },
    {
      target: '#form-salvar',
      title: 'Armazenamento Offline-First',
      pathTag: '📍 CAMINHO: Formulário → Salvar',
      content: 'Os dados são salvos localmente no dispositivo. No campo sem internet, o aplicativo funciona normalmente e sincroniza ao reconectar.',
      placement: 'top',
      spotlightPadding: 6,
    },
    {
      target: 'body',
      title: 'Pronto para Operar!',
      pathTag: '🏁 FLUXO CONCLUÍDO',
      content: 'Você conheceu o fluxo completo: Prioridades → Painel → Gestão de Lotes → Registro de Visitas → Sincronização Offline.',
      placement: 'center',
    },
  ];

  const handleFinish = () => {
    setStepIndex(0);
    onChangeTab('dashboard');
    onCloseVisitForm();
    onCloseSidebar();
    onFinish();
  };

  const prepareUiForStep = (stepIdx: number) => {
    if (stepIdx === 0) {
      onChangeTab('dashboard');
      onCloseSidebar();
      onCloseVisitForm();
    } else if (stepIdx === 1) {
      onChangeTab('prioridades');
      onOpenSidebar();
      onCloseVisitForm();
    } else if (stepIdx === 2 || stepIdx === 3) {
      onChangeTab('dashboard');
      onCloseSidebar();
      onCloseVisitForm();
    } else if (stepIdx === 4) {
      onChangeTab('integrados');
      onOpenSidebar();
      onCloseVisitForm();
    } else if (stepIdx === 5) {
      onChangeTab('visitas');
      onCloseSidebar();
      onCloseVisitForm();
    } else if (stepIdx === 6 || stepIdx === 7) {
      onChangeTab('visitas');
      onCloseSidebar();
      onOpenVisitForm();
    } else if (stepIdx === 8) {
      onChangeTab('dashboard');
      onCloseSidebar();
      onCloseVisitForm();
    }
  };

  const handleJoyrideCallback = (data: any) => {
    const { action, index, status, type } = data;

    const isLastStep = index >= steps.length - 1;
    const isFinished =
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE ||
      action === ACTIONS.STOP ||
      type === EVENTS.TOUR_END ||
      (action === ACTIONS.NEXT && isLastStep && (type === EVENTS.STEP_AFTER || type === EVENTS.STEP_BEFORE));

    if (isFinished) {
      handleFinish();
      return;
    }

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      let nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= steps.length) {
        handleFinish();
        return;
      }

      prepareUiForStep(nextIndex);

      const targetSelector = steps[nextIndex].target as string;

      if (targetSelector === 'body') {
        setStepIndex(nextIndex);
        return;
      }

      // Safe DOM validation with finite attempts to ensure element exists before advancing
      let attempts = 0;
      const verifyAndSetStep = () => {
        attempts++;
        const el = document.querySelector(targetSelector);
        const isValid = el !== null;

        if (isValid || attempts >= 15) {
          setStepIndex(nextIndex);
        } else {
          setTimeout(verifyAndSetStep, 100);
        }
      };

      setTimeout(verifyAndSetStep, 150);
    }
  };

  if (!run) return null;

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      stepIndex={stepIndex}
      scrollToFirstStep
      steps={steps}
      tooltipComponent={CustomTooltip}
      options={{
        overlayColor: 'rgba(15, 23, 42, 0.78)',
        zIndex: 10000,
        overlayClickAction: false,
        blockTargetInteraction: true,
        scrollOffset: 80,
      }}
    />
  );
}
