import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkflowStep = {
    key: string;
    label: string;
    description?: string;
};

type WorkflowStepperProps = {
    steps: WorkflowStep[];
    currentStep: number;
    className?: string;
};

const workflowSteps: WorkflowStep[] = [
    { key: 'request', label: 'Request', description: 'Work order created' },
    { key: 'review', label: 'HOD Review', description: 'Head of Department review' },
    { key: 'assignment', label: 'Assignment', description: 'Team assigned' },
    { key: 'execution', label: 'Execution', description: 'Work in progress' },
    { key: 'verification', label: 'Verification', description: 'Final verification' },
];

export function WorkflowStepper({
    steps = workflowSteps,
    currentStep,
    className,
}: WorkflowStepperProps) {
    return (
        <div className={cn('w-full', className)}>
            <div className="relative flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isUpcoming = index > currentStep;

                    return (
                        <div
                            key={step.key}
                            className="relative flex flex-1 flex-col items-center"
                        >
                            {/* Step Circle */}
                            <div
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-full border-2 transition-all',
                                    isCompleted &&
                                    'border-[#0071b7] bg-[#0071b7] dark:border-[#0093dd] dark:bg-[#0093dd]',
                                    isCurrent &&
                                    'border-[#0071b7] bg-white shadow-md ring-4 ring-[#0071b7]/20 dark:border-[#0093dd] dark:bg-neutral-900 dark:ring-[#0093dd]/20',
                                    isUpcoming &&
                                    'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="size-5 text-white" />
                                ) : (
                                    <span
                                        className={cn(
                                            'text-sm font-semibold',
                                            isCurrent && 'text-[#0071b7] dark:text-[#0093dd]',
                                            isUpcoming && 'text-neutral-400 dark:text-neutral-600'
                                        )}
                                    >
                                        {index + 1}
                                    </span>
                                )}
                            </div>

                            {/* Step Label */}
                            <div className="mt-2 text-center">
                                <p
                                    className={cn(
                                        'text-xs font-medium',
                                        isCompleted && 'text-[#0071b7] dark:text-[#0093dd]',
                                        isCurrent && 'text-neutral-900 dark:text-white',
                                        isUpcoming && 'text-neutral-500 dark:text-neutral-500'
                                    )}
                                >
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="mt-0.5 hidden text-[10px] text-neutral-500 sm:block dark:text-neutral-400">
                                        {step.description}
                                    </p>
                                )}
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute left-[calc(50%+20px)] top-5 h-0.5 w-[calc(100%-40px)]',
                                        isCompleted && 'bg-[#0071b7] dark:bg-[#0093dd]',
                                        isCurrent && 'bg-linear-to-r from-[#0071b7] to-neutral-300 dark:from-[#0093dd] dark:to-neutral-700',
                                        isUpcoming && 'bg-neutral-300 dark:bg-neutral-700'
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
