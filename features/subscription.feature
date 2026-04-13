Feature: Subscription extension

  Scenario Outline: Successful subscription extension
    Given the service is available
    When I request last payment for "<user_id>"
    And I send extension request for "<user_id>" with date "<start_date>" and duration <duration>
    Then the response status should be 200
    And the end date should be "<expected_end_date>"

    Examples:
      | user_id | start_date  | duration | expected_end_date |
      | user1   | 2024-03-15  | 1        | 2024-04-15        |
      | user1   | 2024-03-15  | 3        | 2024-06-15        |
      | user1   | 2024-03-15  | 6        | 2024-09-15        |
      | user1   | 2024-03-15  | 12       | 2025-03-15        |
      | user1   | 2024-01-31  | 1        | 2024-02-29        |

  Scenario: Declined payment
    Given the service is available
    When I send extension request for "user3" with date "2024-03-15" and duration 1
    Then the response status should be 400

  Scenario: Unknown user
    Given the service is available
    When I request last payment for "user999"
    Then the response status should be 404

  Scenario: Invalid duration
    Given the service is available
    When I send extension request for "user1" with date "2024-03-15" and duration 2
    Then the response status should be 400