import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import type { Step, TooltipRenderProps } from 'react-joyride';
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';

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
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-slate-900/95 backdrop-blur-xl text-white p-6 rounded-2xl w-[320px] md:w-[400px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50 relative z-50 font-sans"
    >
      <div className="absolute -inset-[1px] bg-gradient-to-b from-blue-500/30 to-emerald-500/10 rounded-2xl pointer-events-none"></div>
      <button
        {...closeProps}
        onClick={(e) => {
          e.preventDefault();
          if (closeProps.onClick) closeProps.onClick(e as any);
        }}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-800 z-10 touch-manipulation"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="relative z-10">
        {step.title && (
          <h3 className="text-xl font-bold mb-3 pr-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300 tracking-tight">
            {step.title}
          </h3>
        )}
        
        <div className="text-slate-300 leading-relaxed text-[15px] mb-6">
          {step.content}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="flex gap-2">
            {index > 0 && (
              <button
                {...backProps}
                onClick={(e) => {
                  e.preventDefault();
                  if (backProps.onClick) backProps.onClick(e as any);
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              {...primaryProps}
              onClick={(e) => {
                e.preventDefault();
                if (primaryProps.onClick) primaryProps.onClick(e as any);
              }}
              className="flex items-center gap-1 px-5 py-2 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95 touch-manipulation"
            >
              {isLastStep ? (
                <>Concluir <Check className="w-4 h-4 ml-1" /></>
              ) : (
                <>Próximo <ChevronRight className="w-4 h-4" /></>
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

  const steps: Step[] = [
    {
      target: 'body',
      title: 'Bem-vindo ao Suíno DashPro!',
      content: 'Vamos fazer um tour rápido pela plataforma. Nossa interface foi pensada para uso ágil tanto no escritório quanto no campo.',
      placement: 'center',
    },
    {
      target: '#sidebar-item-prioridades',
      title: 'Aba de Prioridades',
      content: 'Aqui você acessa a Fila de Prioridades, listando inteligentemente os lotes que exigem atenção técnica urgente com base em algoritmos de desempenho.',
      placement: 'right',
      spotlightPadding: 5,
    },
    {
      target: '#header-title',
      title: 'Visão Geral (Dashboard)',
      content: 'Nesta tela principal você acompanha os resultados gerais. A interface se adapta perfeitamente ao seu celular ou computador.',
      placement: 'bottom',
    },
    {
      target: '#kpi-alertas',
      title: 'Alertas Inteligentes',
      content: 'Os cards superiores mostram indicadores-chave. Clicando neles, você vê imediatamente quais lotes precisam de atenção.',
      placement: 'bottom',
      spotlightPadding: 10,
    },
    {
      target: '#btn-novo-lancamento',
      title: 'Registrando uma Visita',
      content: 'Aba principal para o técnico de campo. Para registrar novos dados, clique neste botão. Vamos simular um lançamento agora!',
      placement: 'bottom',
      spotlightPadding: 5,
    },
    {
      target: '#form-integrado-nome',
      title: 'Preenchimento Automático',
      content: 'Ao selecionar o produtor, o sistema busca automaticamente a idade do lote e faz os cálculos baseados na curva esperada.',
      placement: 'bottom',
      spotlightPadding: 10,
    },
    {
      target: '#form-salvar',
      title: 'Offline-first & Sincronização',
      content: 'Depois de preencher, basta salvar. Se estiver sem internet, o dado fica salvo no celular e sincroniza sozinho quando a conexão voltar!',
      placement: 'top',
      spotlightPadding: 5,
    },
    {
      target: 'body',
      title: 'Tudo pronto!',
      content: 'O sistema foi desenhado para evitar digitação desnecessária e manter seus dados sempre protegidos. Aproveite!',
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { action, index, status, type } = data;

    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE ||
      (type === EVENTS.STEP_AFTER && index >= steps.length - 1)
    ) {
      setStepIndex(0);
      onChangeTab('dashboard');
      onCloseVisitForm();
      onCloseSidebar();
      onFinish();
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      let nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex >= steps.length) {
        setStepIndex(0);
        onChangeTab('dashboard');
        onCloseVisitForm();
        onCloseSidebar();
        onFinish();
        return;
      }

      // Prepare UI state for the target step before rendering
      if (nextIndex === 0) {
        onChangeTab('dashboard');
        onCloseSidebar();
        onCloseVisitForm();
      } else if (nextIndex === 1) {
        onChangeTab('prioridades');
        onCloseSidebar();
        onCloseVisitForm();
      } else if (nextIndex === 2 || nextIndex === 3) {
        onChangeTab('dashboard');
        onCloseSidebar();
        onCloseVisitForm();
      } else if (nextIndex === 4) {
        onChangeTab('visitas');
        onCloseSidebar();
        onCloseVisitForm();
      } else if (nextIndex === 5 || nextIndex === 6) {
        onChangeTab('visitas');
        onCloseSidebar();
        onOpenVisitForm();
      } else if (nextIndex === 7) {
        onChangeTab('dashboard');
        onCloseSidebar();
        onCloseVisitForm();
      }

      const targetSelector = steps[nextIndex].target as string;

      if (targetSelector === 'body') {
        setStepIndex(nextIndex);
        return;
      }

      // Safe DOM validation with finite attempts to prevent infinite loops or rendering crashes
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
        overlayColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 10000,
        overlayClickAction: false,
        blockTargetInteraction: true,
      }}
    />
  );
}
