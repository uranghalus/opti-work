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

export function WorkflowStepper({ steps = workflowSteps, currentStep, className }: WorkflowStepperProps) {
    return (
        <div className={cn('w-full', className)}>
            <div className="relative flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isUpcoming = index > currentStep;

                    return (
                        <div key={step.key} className="relative flex flex-1 flex-col items-center">
                            {/* Step Circle */}
                            <div
                                className={cn(
                                    'flex size-10 items-center justify-center rounded-full border-2 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                                    isCompleted && 'border-primary bg-primary',
                                    isCurrent && 'border-primary bg-background shadow-[0_0_0_4px] shadow-primary/20 dark:shadow-primary/10',
                                    isUpcoming && 'border-border bg-background',
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="size-5 text-primary-foreground" />
                                ) : (
                                    <span
                                        className={cn(
                                            'text-sm font-semibold transition-colors',
                                            isCurrent && 'text-primary',
                                            isUpcoming && 'text-muted-foreground/50',
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
                                        'text-xs font-medium transition-colors duration-300',
                                        isCompleted && 'text-primary',
                                        isCurrent && 'text-foreground',
                                        isUpcoming && 'text-muted-foreground/50',
                                    )}
                                >
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
                                        {step.description}
                                    </p>
                                )}
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute left-[calc(50%+20px)] top-5 h-0.5 w-[calc(100%-40px)] transition-colors duration-500',
                                        isCompleted && 'bg-primary',
                                        isCurrent && 'bg-gradient-to-r from-primary to-border',
                                        isUpcoming && 'bg-border',
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
