import { JobStatus, ProcessingJob } from '../types/tools';

export type JobUpdateListener = (job: ProcessingJob) => void;

class JobProcessor {
  private activeJobs: Map<string, ProcessingJob> = new Map();
  private listeners: Map<string, Set<JobUpdateListener>> = new Map();
  private cleanupTimers: Map<string, number> = new Map();

  /**
   * Create a new job record with validation checks
   */
  public createJob(toolId: string, file?: File): ProcessingJob {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const job: ProcessingJob = {
      id,
      toolId,
      status: 'QUEUED',
      progress: 0,
      statusMessage: 'Job queued...',
      startTime: Date.now(),
      inputFileName: file?.name,
      inputFileSize: file?.size,
    };

    this.activeJobs.set(id, job);
    this.notify(job);

    // Automatic expiration & memory cleanup after 15 minutes of completion/cancellation
    const timer = window.setTimeout(() => {
      this.cleanupJob(id);
    }, 15 * 60 * 1000);
    this.cleanupTimers.set(id, timer);

    return job;
  }

  /**
   * Subscribe to live progress updates for a job
   */
  public subscribe(jobId: string, listener: JobUpdateListener): () => void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set());
    }
    this.listeners.get(jobId)!.add(listener);

    const current = this.activeJobs.get(jobId);
    if (current) listener(current);

    return () => {
      this.listeners.get(jobId)?.delete(listener);
    };
  }

  /**
   * Update job progress and state
   */
  public updateJob(jobId: string, update: Partial<ProcessingJob>): ProcessingJob | undefined {
    const job = this.activeJobs.get(jobId);
    if (!job) return undefined;

    // Do not update already cancelled jobs unless clearing
    if (job.status === 'CANCELLED' && update.status !== 'CANCELLED') {
      return job;
    }

    const updatedJob: ProcessingJob = {
      ...job,
      ...update,
    };

    if (update.status === 'COMPLETED' || update.status === 'FAILED') {
      updatedJob.endTime = Date.now();
    }

    this.activeJobs.set(jobId, updatedJob);
    this.notify(updatedJob);
    return updatedJob;
  }

  /**
   * Cancel an ongoing processing job
   */
  public cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId);
    if (!job) return false;

    if (job.status === 'COMPLETED' || job.status === 'EXPIRED') {
      return false;
    }

    this.updateJob(jobId, {
      status: 'CANCELLED',
      statusMessage: 'Operation cancelled by user.',
      progress: 0,
    });

    if (job.outputUrl) {
      URL.revokeObjectURL(job.outputUrl);
    }

    return true;
  }

  /**
   * Get specific job details
   */
  public getJob(jobId: string): ProcessingJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all active and recent jobs for Admin dashboard
   */
  public getAllJobs(): ProcessingJob[] {
    return Array.from(this.activeJobs.values()).sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Free memory and revoke object URLs
   */
  public cleanupJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job?.outputUrl) {
      try {
        URL.revokeObjectURL(job.outputUrl);
      } catch {
        // ignore
      }
    }
    const timer = this.cleanupTimers.get(jobId);
    if (timer) {
      clearTimeout(timer);
      this.cleanupTimers.delete(jobId);
    }
    this.activeJobs.delete(jobId);
    this.listeners.delete(jobId);
  }

  /**
   * Validate uploaded file format, size, and magic bytes
   */
  public async validateFile(
    file: File,
    allowedExtensions: string[],
    maxSizeMB: number
  ): Promise<{ valid: boolean; error?: string }> {
    // 1. File size limit
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        valid: false,
        error: `File size exceeds the maximum limit of ${maxSizeMB} MB. (Selected: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }

    // 2. Extension check
    const fileName = file.name.toLowerCase();
    const hasAllowedExt = allowedExtensions.some((ext) => fileName.endsWith(ext.toLowerCase()));
    if (!hasAllowedExt && allowedExtensions.length > 0) {
      return {
        valid: false,
        error: `Unsupported file type. Accepted formats: ${allowedExtensions.join(', ')}`,
      };
    }

    // 3. Magic signature verification (PDF, PNG, JPEG)
    try {
      const slice = file.slice(0, 8);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      if (fileName.endsWith('.pdf')) {
        // PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
        if (bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) {
          return { valid: false, error: 'Malformed or corrupt PDF file (invalid magic signature).' };
        }
      } else if (fileName.endsWith('.png')) {
        // PNG signature: 89 50 4E 47 0D 0A 1A 0A
        if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) {
          return { valid: false, error: 'Malformed or invalid PNG file signature.' };
        }
      } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        // JPEG signature: FF D8 FF
        if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
          return { valid: false, error: 'Malformed or invalid JPEG file signature.' };
        }
      }
    } catch {
      // If slice fails, proceed with standard extension verification
    }

    return { valid: true };
  }

  private notify(job: ProcessingJob): void {
    const jobListeners = this.listeners.get(job.id);
    if (jobListeners) {
      jobListeners.forEach((listener) => {
        try {
          listener(job);
        } catch {
          // ignore
        }
      });
    }
  }
}

export const jobProcessor = new JobProcessor();
