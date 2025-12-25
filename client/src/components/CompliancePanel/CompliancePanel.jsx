import React, { useEffect } from 'react';
import { FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiX, FiEye } from 'react-icons/fi';
import useAdStore from '../../store/useAdStore';

const CompliancePanel = () => {
    const complianceViolations = useAdStore((state) => state.complianceViolations) || [];
    const checkCompliance = useAdStore((state) => state.checkCompliance);
    const elements = useAdStore((state) => state.elements);
    const guidelines = useAdStore((state) => state.guidelines);
    const showCompliancePanel = useAdStore((state) => state.showCompliancePanel);
    const toggleCompliancePanel = useAdStore((state) => state.toggleCompliancePanel);
    const selectElement = useAdStore((state) => state.selectElement);

    // Check compliance whenever elements or guidelines change
    useEffect(() => {
        if (typeof checkCompliance === 'function') {
            checkCompliance();
        }
    }, [elements, guidelines, checkCompliance]);

    // Calculate counts from violations array directly
    const errorCount = complianceViolations.filter(v => v && v.severity === 'error').length;
    const warningCount = complianceViolations.filter(v => v && v.severity === 'warning').length;
    const isCompliant = complianceViolations.length === 0;

    if (!showCompliancePanel) {
        return (
            <button
                className="compliance-toggle-btn"
                onClick={toggleCompliancePanel}
                title="Show Compliance Panel"
            >
                {isCompliant ? (
                    <FiCheckCircle className="text-green" />
                ) : (
                    <FiAlertTriangle className="text-orange" />
                )}
                <span>{isCompliant ? 'Compliant' : `${errorCount + warningCount} Issues`}</span>
            </button>
        );
    }

    return (
        <div className="compliance-panel">
            <div className="compliance-header">
                <h3>
                    <FiAlertTriangle /> Compliance Check
                </h3>
                <button
                    className="close-btn"
                    onClick={toggleCompliancePanel}
                    title="Hide Panel"
                >
                    <FiX />
                </button>
            </div>

            {!guidelines ? (
                <div className="compliance-empty">
                    <FiAlertCircle size={24} />
                    <p>Upload a PDF guideline to enable compliance checking</p>
                    <span className="hint">Guidelines define safe zones, text rules, and image requirements</span>
                </div>
            ) : isCompliant ? (
                <div className="compliance-success">
                    <FiCheckCircle size={32} className="success-icon" />
                    <h4>All Clear!</h4>
                    <p>Your design meets all compliance requirements</p>
                </div>
            ) : (
                <>
                    <div className="compliance-summary">
                        <div className={`summary-badge ${errorCount > 0 ? 'errors' : ''}`}>
                            <FiAlertCircle />
                            <span>{errorCount} Errors</span>
                        </div>
                        <div className={`summary-badge ${warningCount > 0 ? 'warnings' : ''}`}>
                            <FiAlertTriangle />
                            <span>{warningCount} Warnings</span>
                        </div>
                    </div>

                    <div className="violations-list">
                        {complianceViolations.map((violation, idx) => (
                            <div
                                key={idx}
                                className={`violation-item ${violation.severity}`}
                                onClick={() => {
                                    if (violation.elementId && selectElement) {
                                        selectElement(violation.elementId, false);
                                    }
                                }}
                            >
                                <div className="violation-icon">
                                    {violation.severity === 'error' ? (
                                        <FiAlertCircle />
                                    ) : (
                                        <FiAlertTriangle />
                                    )}
                                </div>
                                <div className="violation-content">
                                    <p className="violation-message">{violation.message}</p>
                                    <span className="violation-rule">{violation.rule}</span>
                                </div>
                                {violation.elementId && (
                                    <button
                                        className="violation-action"
                                        title="Focus Element"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectElement) {
                                                selectElement(violation.elementId, false);
                                            }
                                        }}
                                    >
                                        <FiEye size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {guidelines && (
                <div className="compliance-footer">
                    <span>Based on: {guidelines.retailer || 'Uploaded Guidelines'}</span>
                </div>
            )}
        </div>
    );
};

export default CompliancePanel;
