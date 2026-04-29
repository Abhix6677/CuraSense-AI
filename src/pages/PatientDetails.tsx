import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/medical/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  UserCheck,
  MoveLeft,
  MoveRight,
  RotateCcw,
} from "lucide-react";

declare global {
  interface Window {
    faceApiReady?: boolean;
  }
}
declare var faceapi: any;

type TurnStep = "center" | "left" | "right" | "done";

const PatientDetails = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Head-turn verification refs (avoid stale closures)
  const turnStepRef = useRef<TurnStep>("center");
  const humanVerifiedRef = useRef(false);

  // UI state
  const [cameraReady, setCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);
  const [turnStep, setTurnStep] = useState<TurnStep>("center");
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captured, setCaptured] = useState(false);
  const capturedRef = useRef(false);

  const [form, setForm] = useState({
    hospital: "",
    name: "",
    phone: localStorage.getItem("userPhone") || "",
  });

  // ─── Head-turn detection ──────────────────────────────────────
  const detectFace = useCallback(async () => {
    if (!videoRef.current || !window.faceApiReady || humanVerifiedRef.current) return;

    try {
      // Try TinyFaceDetector first (fastest), then SSD fallback
      let detection: any = null;

      // Attempt 1: TinyFaceDetector — very fast
      try {
        detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.2 })
          )
          .withFaceLandmarks(true);
      } catch (_) {}

      // Attempt 2: SSD MobileNet fallback — more accurate
      if (!detection) {
        try {
          detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 })
            )
            .withFaceLandmarks();
        } catch (_) {}
      }

      if (!detection) {
        setFaceDetected(false);
        return;
      }

      setFaceDetected(true);
      setError(null);

      // ── Compute head yaw from nose position relative to face box ──
      const box = detection.detection.box;
      const nose = detection.landmarks.getNose();
      if (!nose || nose.length === 0) return;

      const noseTip = nose[3] || nose[0]; // tip of the nose
      const faceCenterX = box.x + box.width / 2;
      const offset = (noseTip.x - faceCenterX) / (box.width / 2); // -1..+1

      const step = turnStepRef.current;

      if (step === "center") {
        // Very easy center check — face just needs to be roughly in frame
        if (Math.abs(offset) < 0.4) {
          turnStepRef.current = "left";
          setTurnStep("left");
          toast.info("👈 Now turn your head LEFT");
        }
      } else if (step === "left") {
        // Small head turn left is enough (nose shifts right in mirrored view)
        if (offset > 0.10) {
          turnStepRef.current = "right";
          setTurnStep("right");
          toast.info("👉 Great! Now turn your head RIGHT");
        }
      } else if (step === "right") {
        // Small head turn right is enough
        if (offset < -0.10) {
          turnStepRef.current = "done";
          setTurnStep("done");
          humanVerifiedRef.current = true;
          setHumanVerified(true);

          // Stop detection loop
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }

          // Auto-capture photo immediately on verification
          setTimeout(() => {
            autoCapture();
          }, 300);
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  }, []);

  // Auto-capture photo when verification completes
  const autoCapture = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || capturedRef.current) return;

    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    localStorage.setItem("patientPhoto", c.toDataURL("image/png"));
    capturedRef.current = true;
    setCaptured(true);
    toast.success("✅ Verified & photo captured! Fill your details and proceed.");
  }, []);

  // ─── Wait for face-api models ─────────────────────────────────
  useEffect(() => {
    const check = setInterval(() => {
      if (window.faceApiReady) {
        setModelsLoaded(true);
        clearInterval(check);
      }
    }, 300);
    return () => clearInterval(check);
  }, []);

  // ─── Camera + detection loop ──────────────────────────────────
  useEffect(() => {
    let mounted = true;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!mounted) return;
            setCameraReady(true);
            // Start detection quickly – 200ms interval for responsiveness
            setTimeout(() => {
              if (!mounted) return;
              scanIntervalRef.current = setInterval(detectFace, 200);
            }, 600);
          };
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        if (mounted) {
          setError("Camera access denied. Enable camera permission to continue.");
          setCameraReady(false);
        }
      });

    return () => {
      mounted = false;
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [detectFace]);

  // ─── Retake photo (manual) ─────────────────────────────────────
  const capturePhoto = () => {
    if (!humanVerified) {
      toast.error("Complete head-turn verification first");
      return;
    }
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    localStorage.setItem("patientPhoto", c.toDataURL("image/png"));
    capturedRef.current = true;
    setCaptured(true);
    toast.success("Photo updated!");
  };

  // ─── Reset verification (retake) ─────────────────────────────
  const resetVerification = () => {
    turnStepRef.current = "center";
    humanVerifiedRef.current = false;
    capturedRef.current = false;
    setTurnStep("center");
    setHumanVerified(false);
    setCaptured(false);
    toast.info("Verification reset – look at the camera");
    // Restart detection loop
    if (!scanIntervalRef.current) {
      scanIntervalRef.current = setInterval(detectFace, 200);
    }
  };

  // ─── Login handler ────────────────────────────────────────────
  const login = () => {
    if (!form.hospital || !form.name) return toast.error("Please fill Hospital Name and Full Name");
    if (!humanVerified) return toast.error("Complete head-turn verification first");

    // Stop camera before navigating
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Generate random avatar seed for this patient
    const avatarSeed = (form.name || "Patient").replace(/\s+/g, "") + "_" + Date.now();
    localStorage.setItem("patientAvatarSeed", avatarSeed);
    localStorage.removeItem("patientPhoto"); // remove camera photo

    localStorage.setItem("patientDetails", JSON.stringify(form));
    toast.success("✅ Welcome to CuraSense!");
    navigate("/patient-dashboard");
  };

  // Avatar URL for preview
  const previewSeed = (form.name || "Patient").replace(/\s+/g, "") + "_preview";
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(previewSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // ─── Step label helper ────────────────────────────────────────
  const stepLabel = () => {
    switch (turnStep) {
      case "center":
        return "Look straight at the camera";
      case "left":
        return "Turn your head LEFT ←";
      case "right":
        return "Turn your head RIGHT →";
      case "done":
        return "Verified ✓";
    }
  };

  const stepProgress = () => {
    switch (turnStep) {
      case "center": return 0;
      case "left": return 1;
      case "right": return 2;
      case "done": return 3;
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen hero-bg flex flex-col">
      <header className="px-6 py-5 max-w-5xl mx-auto w-full">
        <Logo size="lg" />
      </header>

      <main className="flex-1 grid md:grid-cols-2 gap-6 max-w-5xl w-full mx-auto px-6 pb-12 items-center">
        {/* ──── Camera panel ──── */}
        <div className="glass rounded-3xl p-6 shadow-large animate-slide-up relative">
          <h3 className="font-display font-bold">🔐 Human Verification</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Camera required to prevent fake registration
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 p-3 rounded-xl mb-4">
              <AlertCircle size={16} className="inline mr-2 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {!modelsLoaded && !error && (
            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-blue-400">Loading face detection models…</span>
            </div>
          )}

          {/* Video feed */}
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-muted">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlays */}
            {!cameraReady && (
              <div className="absolute inset-0 bg-destructive/80 flex items-center justify-center">
                <div className="text-center text-white">
                  <AlertCircle size={48} className="mx-auto mb-2" />
                  <div className="font-semibold">Enable Camera Permission</div>
                </div>
              </div>
            )}

            {cameraReady && !faceDetected && !humanVerified && (
              <div className="absolute inset-0 bg-yellow-500/80 flex items-center justify-center">
                <div className="text-center text-black">
                  <Camera size={48} className="mx-auto mb-2" />
                  <div className="font-semibold">Position face in frame</div>
                  <div className="text-xs mt-1 opacity-70">Look directly at the camera</div>
                </div>
              </div>
            )}

            {/* Turn instruction overlay */}
            {cameraReady && faceDetected && !humanVerified && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm">
                  {turnStep === "left" && <MoveLeft size={20} className="animate-bounce-left" />}
                  {turnStep === "right" && <MoveRight size={20} className="animate-bounce-right" />}
                  <span>{stepLabel()}</span>
                </div>
              </div>
            )}

            {/* Verified overlay */}
            {humanVerified && !captured && (
              <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                <div className="rounded-full bg-emerald-500 p-6 shadow-2xl animate-scale-in">
                  <UserCheck size={48} className="text-white" />
                </div>
              </div>
            )}

            {captured && (
              <div className="absolute inset-0 bg-background flex flex-col items-center justify-center animate-fade-in z-10">
                <div className="h-32 w-32 rounded-full ring-4 ring-primary/30 overflow-hidden bg-primary/10 shadow-large mb-4">
                  <img src={avatarUrl} alt="Avatar Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center text-primary font-bold gap-2">
                  <CheckCircle2 size={20} />
                  <span>Avatar Generated!</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-1.5">
            {["Center", "Left", "Right"].map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    stepProgress() > i ? "bg-emerald-500" : "bg-muted-foreground/20"
                  }`}
                />
                <div className="text-[10px] text-muted-foreground mt-1 text-center">{label}</div>
              </div>
            ))}
          </div>

          {/* Status indicators */}
          <div className="space-y-1.5 mt-3">
            <StatusDot active={modelsLoaded} label={modelsLoaded ? "Models loaded ✓" : "Loading models…"} color={modelsLoaded ? "emerald" : "yellow"} />
            <StatusDot active={cameraReady} label={cameraReady ? "Camera ready" : "Camera blocked"} color={cameraReady ? "emerald" : "red"} />
            <StatusDot active={faceDetected || humanVerified} label={faceDetected || humanVerified ? "Face detected" : "Waiting for face"} color={faceDetected || humanVerified ? "emerald" : "yellow"} />
            <StatusDot active={humanVerified} label={humanVerified ? "Human verified ✓" : stepLabel()} color={humanVerified ? "emerald" : "orange"} />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            {humanVerified && captured && (
              <Button
                onClick={capturePhoto}
                variant="outline"
                className="flex-1 rounded-xl h-11"
              >
                <Camera size={16} className="mr-2" />
                Retake Photo
              </Button>
            )}
            {humanVerified && (
              <Button
                onClick={resetVerification}
                variant="ghost"
                className="rounded-xl h-11 px-3"
                title="Redo verification"
              >
                <RotateCcw size={16} className="mr-1" />
                <span className="text-xs">Redo</span>
              </Button>
            )}
          </div>
        </div>

        {/* ──── Form panel ──── */}
        <div className="glass rounded-3xl p-8 shadow-large animate-slide-up">
          <h2 className="font-display text-2xl font-bold">Your Details</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Complete verification to get started.
          </p>

          <div className="space-y-4">
            <Field
              label="Hospital Name"
              value={form.hospital}
              onChange={(v: string) => setForm({ ...form, hospital: v })}
              placeholder="CuraSense Medical Center"
            />
            <Field
              label="Full Name"
              value={form.name}
              onChange={(v: string) => setForm({ ...form, name: v })}
              placeholder="Your name"
              pattern="name"
            />
            <Field
              label="Mobile Number"
              value={form.phone}
              onChange={(v: string) => setForm({ ...form, phone: v })}
              pattern="phone"
            />

            <Button
              onClick={login}
              disabled={!humanVerified}
              className="w-full h-12 rounded-xl bg-gradient-primary shadow-glow font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck size={18} className="mr-2" />
              Proceed to Dashboard
              <ArrowRight size={16} className="ml-2" />
            </Button>

            {/* Status message */}
            <div className="text-xs text-center pt-2">
              {!humanVerified && (
                <span className="text-orange-400">⚠ Complete head-turn verification on the left</span>
              )}
              {humanVerified && (!form.hospital || !form.name) && (
                <span className="text-blue-400">📝 Fill in Hospital Name and Full Name above</span>
              )}
              {humanVerified && form.hospital && form.name && (
                <span className="text-emerald-400">✅ All set! Click the button above to proceed</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ─── Reusable sub-components ──────────────────────────────────── */

const StatusDot = ({ active, label, color }: { active: boolean; label: string; color: string }) => {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    yellow: "bg-yellow-500 animate-pulse",
    red: "bg-destructive",
    orange: "bg-orange-500",
  };
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${colorMap[color] || "bg-muted"}`} />
      {label}
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, disabled, type = "text", pattern }: any) => (
  <div>
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </Label>
    <Input
      type={type}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value;
        if (pattern === "name") v = v.replace(/[^a-zA-Z\s]/g, "");
        else if (pattern === "phone") v = v.replace(/[^0-9]/g, "").slice(0, 10);
        onChange(v);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className="h-12 rounded-xl mt-1.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50"
    />
  </div>
);

export default PatientDetails;
