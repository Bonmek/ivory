import { motion, AnimatePresence } from "framer-motion";
import React, { forwardRef } from "react";

// Enhanced animated status card for feedback
const StatusMotionCard = forwardRef<HTMLDivElement, {
  icon: React.ReactNode;
  color: "yellow" | "red" | "green";
  title: React.ReactNode;
  description?: React.ReactNode;
  ariaLive?: "polite" | "assertive";
  className?: string;
  children?: React.ReactNode;
}>(({ icon, color, title, description, ariaLive = "polite", className = "", children }, ref) => {
  // Color theme mapping for light/dark
  const colorMap: Record<string, string> = {
    yellow: "bg-yellow-50/20 dark:bg-yellow-900/30 border-yellow-200/70 dark:border-yellow-600/60 shadow-yellow-100/30 dark:shadow-yellow-900/40",
    red: "bg-red-50/20 dark:bg-red-900/30 border-red-200/70 dark:border-red-600/60 shadow-red-100/30 dark:shadow-red-900/40",
    green: "bg-green-50/20 dark:bg-green-900/30 border-green-200/70 dark:border-green-600/60 shadow-green-100/30 dark:shadow-green-900/40",
  };
  const borderMap: Record<string, string> = {
    yellow: "border-yellow-400/50 dark:border-yellow-500/70",
    red: "border-red-400/50 dark:border-red-500/70",
    green: "border-green-400/50 dark:border-green-500/70",
  };
  const iconBgMap: Record<string, string> = {
    yellow: "bg-yellow-100/60 dark:bg-yellow-950/50",
    red: "bg-red-100/60 dark:bg-red-950/50",
    green: "bg-green-100/60 dark:bg-green-950/50",
  };
  const textMap: Record<string, string> = {
    yellow: "text-yellow-600 dark:text-yellow-300",
    red: "text-red-600 dark:text-red-300",
    green: "text-green-600 dark:text-green-300",
  };
  const descMap: Record<string, string> = {
    yellow: "text-yellow-500/90 dark:text-yellow-200/80",
    red: "text-red-500/90 dark:text-red-200/80",
    green: "text-green-500/90 dark:text-green-200/80",
  };
  return (
    <motion.article
      ref={ref as any}
      initial={{ opacity: 0, scale: 0.92, y: -24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -24 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      layout
      aria-live={ariaLive}
      className={`relative flex items-center gap-4 p-5 mb-3 rounded-xl border-2 ${colorMap[color]} ${borderMap[color]} shadow-lg transition-all duration-400 hover:shadow-2xl ${className}`}
      tabIndex={0}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={`flex items-center justify-center w-12 h-12 rounded-full border ${borderMap[color]} shadow-inner ${iconBgMap[color]}`}
      >
        {icon}
      </motion.div>
      <div className="flex flex-col gap-1">
        <motion.span
          className={`text-base font-semibold capitalize tracking-tight ${textMap[color]}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.span>
        {description && (
          <motion.span
            className={`text-xs ${descMap[color]}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
          >
            {description}
          </motion.span>
        )}
        {children}
      </div>
    </motion.article>
  );
});
StatusMotionCard.displayName = "StatusMotionCard";


import { Card, CardContent } from "@/components/ui/card";
import { buildOutputSettingsType, advancedOptionsType } from "@/types/CreateWebstie/types";
import { frameworks } from "@/constants/frameworks";
import { Check, AlertCircle, Info, Sparkles, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import { DeployingState, BuildingState } from "@/types/CreateWebstie/enums";
import { Link, useNavigate } from "react-router";
import { useRef, useEffect, useState } from 'react';
import { ApiResponse } from "@/types/CreateWebstie/types";

interface PreviewSummaryProps {
  name: string;
  selectedFramework: string | null;
  buildOutputSettings: buildOutputSettingsType;
  advancedOptions: advancedOptionsType;
  uploadMethod: string;
  selectedFile?: File | null;
  setOpen: (open: boolean) => void;
  setShowPreview: (showPreview: boolean) => void;
  selectedRepoFile?: File | null;
  showBuildOutputSettings: boolean;
  deployingState: DeployingState;
  deployingResponse: ApiResponse | null;
  buildingState: BuildingState;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

// Checklist component for deployment/build steps
const StatusChecklist: React.FC<{ deployingState: DeployingState, buildingState: BuildingState }> = ({ deployingState, buildingState }) => {
  // Step status: 'done', 'in-progress', 'pending'
  const steps = [
    {
      key: 'confirm',
      label: <FormattedMessage id="checklist.confirm" defaultMessage="Waiting for Confirmation" />,
      status:
        deployingState === DeployingState.None
          ? 'in-progress'
          : (deployingState === DeployingState.Deploying || deployingState === DeployingState.Deployed || deployingState === DeployingState.Failed)
            ? 'done'
            : 'pending',
      icon: 'clock',
    },
    {
      key: 'deploy',
      label: deployingState === DeployingState.Failed
        ? <FormattedMessage id="checklist.failed" defaultMessage="Failed" />
        : <FormattedMessage id="checklist.deploy" defaultMessage="Deploying" />,
      status:
        deployingState === DeployingState.Failed
          ? 'failed'
          : deployingState === DeployingState.Deployed
            ? 'done'
            : deployingState === DeployingState.Deploying
              ? 'in-progress'
              : 'pending',
    },
    {
      key: 'build',
      label: (deployingState === DeployingState.Deployed && buildingState === BuildingState.Failed)
        ? <FormattedMessage id="checklist.failed" defaultMessage="Failed" />
        : <FormattedMessage id="checklist.build" defaultMessage="Building" />,
      status:
        (deployingState === DeployingState.Deployed && buildingState === BuildingState.Failed)
          ? 'failed'
          : (deployingState === DeployingState.Deployed && buildingState === BuildingState.Built)
            ? 'done'
            : (deployingState === DeployingState.Deployed && (buildingState === BuildingState.Building || buildingState === BuildingState.None))
              ? 'in-progress'
              : 'pending',
    },
    {
      key: 'done',
      label: (deployingState === DeployingState.Deployed && buildingState === BuildingState.Failed)
        ? <FormattedMessage id="checklist.failed" defaultMessage="Failed" />
        : <FormattedMessage id="checklist.done" defaultMessage="Done" />,
      status:
        (deployingState === DeployingState.Deployed && buildingState === BuildingState.Failed)
          ? 'failed'
          : (deployingState === DeployingState.Deployed && buildingState === BuildingState.Built)
            ? 'done'
            : 'pending',
      icon: 'check-circle',
    },
  ];
  return (
    <div className="w-full mb-4">
      <div className="w-full px-2">

        <ul
          className="w-full flex flex-row items-center justify-center gap-0 px-4 py-4 bg-gradient-to-r from-primary-900/70 via-primary-800/80 to-primary-900/70 dark:from-gray-900/80 dark:via-gray-800/90 dark:to-gray-900/80 rounded-2xl shadow-lg border-2 border-muted/30"
        >
          {steps.map((step, i) => (
            <>
              <motion.li
                key={step.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={
                  "flex items-center gap-3 px-5 py-2 rounded-xl transition-all duration-200 " +
                  (step.status === 'failed'
                    ? 'bg-red-100/40 dark:bg-red-900/40 shadow-md shadow-red-200/30 dark:shadow-red-900/40'
                    : step.status === 'done'
                      ? 'bg-green-100/40 dark:bg-green-900/40 shadow-sm'
                      : step.status === 'in-progress'
                        ? 'bg-yellow-50/40 dark:bg-yellow-900/40 shadow-sm animate-pulse'
                        : 'hover:bg-gray-100/40 dark:hover:bg-gray-800/40')
                }
                tabIndex={0}
              >
                {step.status === 'done' && (step.key === 'done'
                  ? <span className="w-6 h-6 flex items-center justify-center bg-green-200 dark:bg-green-900 rounded-full p-1 shadow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                  : <Check className="w-6 h-6 text-green-500 bg-green-100 dark:bg-green-900 rounded-full p-1 shadow" />)}
                {step.status === 'failed' && (
                  <span className="w-6 h-6 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-full p-1 shadow "><X className="w-5 h-5 text-red-500" /></span>
                )}
                {step.status === 'in-progress' && (step.key === 'confirm'
                  ? <span className="w-6 h-6 flex items-center justify-center bg-yellow-50 dark:bg-yellow-900 rounded-full p-1 shadow animate-pulse"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                  : <RefreshCw className="w-6 h-6 text-yellow-400 bg-yellow-50 dark:bg-yellow-900 rounded-full p-1 animate-spin shadow" />)}
                {step.status === 'pending' && (step.key === 'done'
                  ? <span className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-full p-1 shadow"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 dark:text-gray-600"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" /></svg></span>
                  : <span className="inline-block w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800" />)}
                <span className={
                  step.status === 'done'
                    ? 'text-green-600 dark:text-green-300 font-semibold'
                    : step.status === 'in-progress'
                      ? 'text-yellow-500 dark:text-yellow-300 font-semibold'
                      : 'text-gray-400 dark:text-gray-500'
                }>
                  {step.label}
                </span>
              </motion.li>
              {/* Divider/progress bar except after last item */}
              {i < steps.length - 1 && (
                <span className="h-6 w-8 flex items-center justify-center">
                  <span className="block w-full h-1 rounded-full bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 dark:from-primary-900 dark:via-primary-700 dark:to-primary-900 opacity-70 mx-0.5" />
                </span>
              )}
            </>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const PreviewSummary: React.FC<PreviewSummaryProps> = ({
  name,
  selectedFramework,
  buildOutputSettings,
  advancedOptions,
  uploadMethod,
  selectedFile,
  deployingState,
  setOpen,
  setShowPreview,
  selectedRepoFile,
  showBuildOutputSettings,
  deployingResponse,
  buildingState,
}) => {
  const intl = useIntl();
  const deployStatusRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Countdown logic for redirect
  const [countdown, setCountdown] = useState(10);
  const showCountdown = deployingState === DeployingState.Deployed && buildingState === BuildingState.Built;

  useEffect(() => {
    if (showCountdown) {
      setCountdown(10);
    }
  }, [showCountdown]);

  useEffect(() => {
    if (!showCountdown) return;
    if (countdown <= 0) {
      navigate('/dashboard');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, showCountdown, navigate]);

  useEffect(() => {
    if (deployingState === DeployingState.Deploying && deployStatusRef.current) {
      const element = deployStatusRef.current;
      const targetPosition = element.offsetTop - 100; // Adjust the offset as needed
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }, [deployingState]);

  const framework = selectedFramework
    ? frameworks.find((f) => f.id === selectedFramework)
    : frameworks[0];


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Title Section */}
      <article className="flex flex-col gap-4 mb-8">
        {/* Checklist of tasks */}
        <StatusChecklist deployingState={deployingState} buildingState={buildingState} />
        <AnimatePresence mode="wait">
          {(() => {
            // Show both success and countdown cards after build
            if (deployingState === DeployingState.Deployed && buildingState === BuildingState.Built) {
              const successCard = (
                <StatusMotionCard
                  key="built"
                  icon={<Check className="w-5 h-5 text-green-400" />}
                  color="green"
                  title={<FormattedMessage id="createWebsite.built" defaultMessage="Built successfully!" />}
                  description={<FormattedMessage
                    id="createWebsite.viewDashboardbuilt"
                    defaultMessage="You can now see your deployed website at {dashboardLink}"
                    values={{
                      dashboardLink: (
                        <Link
                          to="/dashboard"
                          className="font-medium underline underline-offset-2 hover:text-green-600 transition-colors duration-300"
                        >
                          Dashboard
                        </Link>
                      )
                    }}
                  />}
                  ariaLive="polite"
                />
              );
              const countdownCard = (countdown < 10) ? (
                <StatusMotionCard
                  key="built-countdown"
                  icon={<Check className="w-5 h-5 text-green-400" />}
                  color="green"
                  title={<FormattedMessage id="createWebsite.redirecting" defaultMessage="Redirecting to dashboard..." />}
                  description={
                    <span>
                      <FormattedMessage id="createWebsite.redirectIn" defaultMessage="You will be redirected in {seconds} seconds." values={{ seconds: countdown }} />
                    </span>
                  }
                  ariaLive="polite"
                >
                  <Button
                    variant="outline"
                    className="mt-2 w-fit"
                    onClick={() => navigate('/dashboard')}
                  >
                    <FormattedMessage id="createWebsite.goNow" defaultMessage="Go now" />
                  </Button>
                </StatusMotionCard>
              ) : null;
              return <>{successCard}{countdownCard}</>;
            }
            if (deployingState === DeployingState.Deploying) {
              return (
                <StatusMotionCard
                  ref={deployStatusRef}
                  key="deploying"
                  icon={<RefreshCw className="w-6 h-6 text-yellow-400 animate-spin" />}
                  color="yellow"
                  title={<FormattedMessage id="createWebsite.processingRequest" defaultMessage="Processing your request..." />}
                  description={<FormattedMessage id="createWebsite.processingTime" defaultMessage="This may take a few moments" />}
                  ariaLive="polite"
                />
              );
            }
            if (deployingState === DeployingState.Failed && deployingResponse) {
              return (
                <StatusMotionCard
                  key="failed"
                  icon={<X className="w-6 h-6 text-red-400" />}
                  color="red"
                  title={<FormattedMessage id="createWebsite.failedToDeploy" defaultMessage="Failed to deploy" />}
                  description={<>
                    <FormattedMessage id="createWebsite.failedToDeployDescription" defaultMessage="Please try again or contact support for assistance." />
                    {deployingResponse.statusCode === 0 && deployingResponse.error && (
                      <span className="block mt-1">{deployingResponse.error.error_message}</span>
                    )}
                  </>}
                  ariaLive="assertive"
                >
                  <Button
                    className="mt-2 flex items-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white px-6 py-2 rounded-lg font-semibold text-base shadow-lg shadow-red-100/30 dark:shadow-red-900/40 transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                    style={{ boxShadow: '0 2px 16px 0 rgba(255, 76, 76, 0.15)' }}
                    onClick={() => setOpen(true)}
                  >
                    <RefreshCw className="w-5 h-5 mr-1 -ml-1 animate-spin-slow" />
                    <FormattedMessage id="createWebsite.redeploy" defaultMessage="Redeploy" />
                  </Button>
                </StatusMotionCard>
              );
            }
            if (deployingState === DeployingState.Deployed && deployingResponse) {
              if (buildingState === BuildingState.Building || buildingState === BuildingState.None) {
                return (
                  <StatusMotionCard
                    ref={deployStatusRef}
                    key="building"
                    icon={<RefreshCw className="w-6 h-6 text-yellow-400 animate-spin" />}
                    color="yellow"
                    title={<FormattedMessage id="createWebsite.building" defaultMessage="Building..." />}
                    description={<FormattedMessage id="createWebsite.buildingTime" defaultMessage="This may take a few moments" />}
                    ariaLive="polite"
                  />
                );
              }
              if (buildingState === BuildingState.Failed) {
                return (
                  <StatusMotionCard
                    key="build-failed"
                    icon={<X className="w-6 h-6 text-red-400" />}
                    color="red"
                    title={<FormattedMessage id="createWebsite.failedToBuild" defaultMessage="Failed to build" />}
                    description={<FormattedMessage id="createWebsite.failedToBuildDescription" defaultMessage="Please try again or contact support for assistance." />}
                    ariaLive="assertive"
                  />
                );
              }
            }
            return null;
          })()}
        </AnimatePresence>
        <section className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight font-pixel">
              <FormattedMessage id="createWebsite.previewProjectName" />
            </h1>
          </div>
        </section>
        <p className="text-muted-foreground text-sm tracking-wide">
          <FormattedMessage id="createWebsite.previewSummaryDescription" />
        </p>
      </article>

      <Card className="w-full border-2 border-muted/30 bg-primary-800 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
        <CardContent className="space-y-12 pb-2 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className={`space-y-6 ${(!showBuildOutputSettings && i === 0) || i === 2 ? "md:col-span-2" : ""}`}
              >
                {i === 0 && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                      <Info className="h-5 w-5 text-blue-500 hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        <FormattedMessage id="createWebsite.previewBasicInformation" />
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: intl.formatMessage({ id: "createWebsite.previewProjectName" }), value: name },
                        {
                          label: intl.formatMessage({ id: "createWebsite.previewFramework" }),
                          value: framework?.name || intl.formatMessage({ id: "createWebsite.previewNotSelected" }),
                        },
                        { label: intl.formatMessage({ id: "createWebsite.previewUploadMethod" }), value: uploadMethod },
                      ].map(({ label, value }, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">•</span>
                            <span className="font-semibold text-gray-100 ml-1">{value}</span>
                          </div>
                        </motion.div>
                      ))}
                      {(uploadMethod === "upload" && selectedFile) && (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={3}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              <FormattedMessage id="createWebsite.previewSelectedFile" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">•</span>
                              <span className="font-semibold text-gray-100 ml-1">{selectedFile.name}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {(uploadMethod === "github" && selectedRepoFile) && (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={4}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              <FormattedMessage id="createWebsite.previewSelectedRepository" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">•</span>
                              <span className="font-semibold text-gray-100 ml-1">{selectedRepoFile.name.replace(/\.zip$/, '')}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}

                {i === 1 && showBuildOutputSettings && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        <FormattedMessage id="createWebsite.previewBuildSettings" />
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {Object.values(buildOutputSettings).every(v => !v) ? (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={0}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              <FormattedMessage id="createWebsite.previewStatus" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400">•</span>
                            <span className="font-semibold text-gray-100 ml-1">
                              <FormattedMessage id="createWebsite.previewNotBuilt" />
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        [
                          { label: intl.formatMessage({ id: "createWebsite.previewBuildCommand" }), value: buildOutputSettings.buildCommand },
                          { label: intl.formatMessage({ id: "createWebsite.previewInstallCommand" }), value: buildOutputSettings.installCommand },
                          { label: intl.formatMessage({ id: "createWebsite.previewOutputDirectory" }), value: buildOutputSettings.outputDirectory },
                        ].map(({ label, value }, idx) => (
                          <motion.div
                            key={idx}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={idx}
                            className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-medium">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">•</span>
                              <span className="font-semibold text-gray-100 ml-1">{value || intl.formatMessage({ id: "createWebsite.previewNotSet" })}</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {i === 2 && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-3">
                      <Info className="h-5 w-5 text-purple-500 hover:scale-110 transition-transform -ml-0.5" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        <FormattedMessage id="createWebsite.previewAdvancedSettings" />
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: intl.formatMessage({ id: "createWebsite.previewCacheControl" }), value: `${advancedOptions.cacheControl} day(s)` },
                        { label: intl.formatMessage({ id: "createWebsite.previewDefaultPath" }), value: advancedOptions.defaultPath },
                        { label: intl.formatMessage({ id: "createWebsite.previewRootDirectory" }), value: advancedOptions.rootDirectory },
                      ].map(({ label, value }, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">•</span>
                            <span className="font-semibold text-gray-100 ml-1">{value || intl.formatMessage({ id: "createWebsite.previewNotSet" })}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {deployingState === DeployingState.None && (
        <div className="flex justify-end gap-4 mt-8">
          <Button
            className="bg-accent hover:bg-accentHover text-accentForeground p-6 rounded-md text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
            onClick={() => { setShowPreview(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <FormattedMessage
              id="createWebsite.continueEditing"
              defaultMessage="Continue Editing"
            />
          </Button>
          <Button
            className="bg-secondary-500 hover:bg-secondary-700 text-black p-6 rounded-md text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/20"
            onClick={() => {
              setOpen(true);
            }}
          >
            <FormattedMessage
              id="createWebsite.deploy"
              defaultMessage="Deploy"
            />
          </Button>
        </div>
      )}
    </motion.div>
  )
}