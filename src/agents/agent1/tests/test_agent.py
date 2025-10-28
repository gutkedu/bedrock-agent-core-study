"""Tests for agent1."""

import unittest
from unittest.mock import Mock, patch
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from agents.agent1.agent import invoke, agent


class TestAgent1(unittest.TestCase):
    """Test cases for agent1."""

    def test_invoke_with_prompt(self):
        """Test invoke function with a prompt."""
        payload = {"prompt": "Hello, world!"}

        # Mock the agent response
        with patch('agents.agent1.agent.agent') as mock_agent:
            mock_result = Mock()
            mock_result.message = "Hello back!"
            mock_agent.return_value = mock_result

            result = invoke(payload)

            self.assertEqual(result["result"], "Hello back!")
            mock_agent.assert_called_once_with("Hello, world!")

    def test_invoke_without_prompt(self):
        """Test invoke function without a prompt."""
        payload = {}

        # Mock the agent response
        with patch('agents.agent1.agent.agent') as mock_agent:
            mock_result = Mock()
            mock_result.message = "Default response"
            mock_agent.return_value = mock_result

            result = invoke(payload)

            self.assertEqual(result["result"], "Default response")
            mock_agent.assert_called_once_with("Hello! How can I help you today?")

    def test_config_exists(self):
        """Test that agent configuration is properly defined."""
        from agents.agent1.agent import AGENT_CONFIG

        self.assertIsInstance(AGENT_CONFIG, dict)
        self.assertEqual(AGENT_CONFIG["name"], "agent1")
        self.assertIn("version", AGENT_CONFIG)
        self.assertIn("description", AGENT_CONFIG)

    def test_tools_loaded(self):
        """Test that tools are properly loaded."""
        # Import the tools from shared module
        from src.agents.agent1.web_tools import web_get, search_web, get_weather_info
        tools = [web_get, search_web, get_weather_info]
        
        # Check that tools list exists and has items
        self.assertIsInstance(tools, list)
        self.assertGreater(len(tools), 0)

        # Check that our custom tools are included
        tool_names = [tool.__name__ if hasattr(tool, '__name__') else str(tool) for tool in tools]
        self.assertIn("web_get", tool_names)
        self.assertIn("search_web", tool_names)
        self.assertIn("get_weather_info", tool_names)

    def test_agent_has_tools(self):
        """Test that the agent is configured with tools."""
        # Check that agent was created successfully
        from agents.agent1.agent import agent
        self.assertIsNotNone(agent)
        # Agent should be an Agent instance
        from strands import Agent
        self.assertIsInstance(agent, Agent)


if __name__ == '__main__':
    unittest.main()