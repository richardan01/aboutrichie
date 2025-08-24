import type { BackendErrorSchema } from "convex/errors";
import { ConvexError } from "convex/values";
import {
  ErrorBoundary,
  type ErrorBoundaryProps,
  type FallbackProps,
} from "react-error-boundary";
import { Button } from "./ui/button";

type ConvexErrorFallbackProps = FallbackProps & {
  renderElementWithWrapper?: (props: {
    children: React.ReactNode;
  }) => React.ReactElement;
};

export function GenericErrorBoundary({
  resetErrorBoundary,
  message = "Something went wrong 💀",
  renderElementWithWrapper,
}: ConvexErrorFallbackProps & {
  message?: string;
}) {
  const handleReset = () => {
    try {
      console.log("Reset button clicked");
      if (resetErrorBoundary) {
        resetErrorBoundary();
      } else {
        console.error("resetErrorBoundary function is not available");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during reset:", error);
      window.location.reload();
    }
  };

  const content = (
    <div className={"flex flex-col gap-4 items-center justify-center"}>
      <h1 className={"text-xl font-semibold text-center"}>{message}</h1>
      <Button onClick={handleReset}>Reset</Button>
    </div>
  );

  if (renderElementWithWrapper) {
    return renderElementWithWrapper({ children: content });
  }

  return content;
}

export function ConvexErrorElement({
  error,
  resetErrorBoundary,
  renderElementWithWrapper,
}: Omit<ConvexErrorFallbackProps, "error"> & {
  error: ConvexError<any>;
}) {
  const _error = error.data as BackendErrorSchema;

  return (
    <GenericErrorBoundary
      message={_error.context.message}
      error={_error}
      resetErrorBoundary={resetErrorBoundary}
      renderElementWithWrapper={renderElementWithWrapper}
    />
  );
}

export function CustomErrorBoundary(
  props: Partial<ErrorBoundaryProps> & {
    wrapRenderFallback?: (props: {
      children: React.ReactNode;
    }) => React.ReactElement;
  }
) {
  const {
    children,
    wrapRenderFallback,
    fallbackRender = (props) => {
      if (props.error instanceof ConvexError) {
        return (
          <ConvexErrorElement
            {...props}
            renderElementWithWrapper={wrapRenderFallback}
          />
        );
      }

      return (
        <GenericErrorBoundary
          {...props}
          renderElementWithWrapper={wrapRenderFallback}
        />
      );
    },
    ...rest
  } = props;

  return (
    // @ts-ignore
    <ErrorBoundary fallbackRender={fallbackRender} {...rest}>
      {children}
    </ErrorBoundary>
  );
}
